import {app, sparqlEscapeUri, query} from 'mu';
import bodyParser from 'body-parser';
import flatten from 'lodash.flatten';

app.use(bodyParser.json({
    type: function (req) {
        return /^application\/json/.test(req.get('content-type'));
    }
}));

app.get('/hello', function (req, res) {
    res.send('Hello stats-service');
});

app.post('/delta', async function (req, res) {
    const delta = req.body;

    const inserts = flatten(delta.map(changeSet => changeSet.inserts));
    if (!inserts.length) {
        console.log('Inserts is empty');
        return res.status(204).send();
    }

    const subject = inserts[0].subject.value;
    const ratingUri = sparqlEscapeUri(subject);

    const averageQuery = `
        PREFIX schema: <http://schema.org/>
        PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>
        
        DELETE {
          GRAPH <http://mu.semte.ch/graphs/public> {
            ?album schema:ratingValue ?oldAvg .
          }
        }
        INSERT {
          GRAPH <http://mu.semte.ch/graphs/public> {
            ?album schema:ratingValue ?newAvg .
          }
        }
        WHERE {
          GRAPH <http://mu.semte.ch/graphs/public> {
            VALUES ?rating { ${ratingUri} }
            ?rating schema:itemReviewed ?album .
        
            OPTIONAL { ?album schema:ratingValue ?oldAvg . }
        
            {
              SELECT ?album (AVG(xsd:decimal(?score)) AS ?newAvg)
              WHERE {
                GRAPH <http://mu.semte.ch/graphs/public> {
                  ?r a schema:Review ;
                     schema:itemReviewed ?album ;
                     schema:reviewRating ?score .
                }
              }
              GROUP BY ?album
            }
          }
        }
    `;

    query(averageQuery).then(function (response) {
        return res.status(204).send();
    });
});