const express = require('express');

const app = express();

const connectToMongo = require('./db');


connectToMongo();

app.use(express.json());

// app.use(bodyparser.urlencoded({ extended: false }))

app.use('/Upload_avatar',express.static('Upload_avatar'))

const port = process.env.PORT || 8000

app.get('/',(req,res)=>{
    res.json({"app":"ready"})
})

app.use('/api/',require('./Routes/user_route/User_controller'));
app.use('/api/note',require('./Routes/notes_route/note_controller'));

app.listen(port,()=>{
    console.log(`shotpost app listening on port ${port}`)
})