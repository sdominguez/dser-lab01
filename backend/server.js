const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Etag']
  };


app.use(cors(corsOptions));

let items = [
    {id: 1, name: "Product1", deleted:false},
    {id: 2, name: "Product2", deleted:false},
    {id: 3, name: "Product4", deleted:true}
];

app.get('/products', (req, res, next) => {
    try {
        const activeItems = items.filter(i => !i.deleted);
        
        const etag = `"${Buffer.from(JSON.stringify(activeItems)).toString('base64')}"`;
        console.log(`etag ${etag}`);
        console.log(`If-None-Match ${req.headers['If-None-Match']}`)

        if (req.headers['If-None-Match'] === etag) {
            res.status(304).end();
        } else {
            res.setHeader('ETag', etag);
            res.json(activeItems);
        }
    } catch (err){
        next(err);
    }
});

app.use((req, res)=>{
    res.status(404).json({
        error:"Not Found",
        message: "Route does not exist"
    });
});

app.use((err, req, res, next)=>{
    console.error(err);
    res.status(500).json({
        error:"Internal Server Error",
        message: "Unexpected failure"
    });
});

app.listen(3001, ()=>
    console.log("Server running on http://localhost:3001")
);
