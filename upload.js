var express = require("express"), 
    fs = require("fs"),
	app = express(),
	http = require("http").Server(app).listen(80);
	upload = require("express-fileupload");
app.use(upload())
var cors = require('cors')
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
console.log("Server started! ");
app.get('/',function(req,res){
	res.sendFile(__dirname + "/upload.html");
})

app.post("/",function(req,res){
	if(req.files){
        var file = req.files.csv,
            filename = file.name;
        file.mv('./upload/' + filename,function(err){
            if(err){
                console.log(err)
                res.send("error occured")
            }else{
                fs.readFile('./upload/' + filename,'utf8',function(error,data){
                    res.send(data);
                });

            }
        })
		console.log(req.files)
    }
})
