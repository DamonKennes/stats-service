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
    const deletes = flatten(delta.map(changeSet => changeSet.deletes));

    const ITEM_REVIEWED = 'http://schema.org/itemReviewed';
    const albumTriple =
        inserts.find(t => t.predicate?.value === ITEM_REVIEWED) ||
        deletes.find(t => t.predicate?.value === ITEM_REVIEWED);

    if (!albumTriple) {
        return res.status(204).send();
    }

    const albumUri = sparqlEscapeUri(albumTriple.object.value);

    const avgQuery = `
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
            {
              SELECT ?album (COALESCE(?avg, 0) AS ?newAvg)
              WHERE {
                VALUES ?album { ${albumUri} }
        
                OPTIONAL {
                  SELECT ?album (AVG(xsd:decimal(?score)) AS ?avg)
                  WHERE {
                    ?r a schema:Review ;
                       schema:itemReviewed ?album ;
                       schema:reviewRating ?score .
                  }
                  GROUP BY ?album
                }
              }
            }
            OPTIONAL { ?album schema:ratingValue ?oldAvg . }
          }
        }`;

    query(avgQuery).then(function (response) {
        return res.status(204).send();
    });
})