var express = require("express"), 
    fs = require("fs"),
	app = express(),
	http = require("http").Server(app).listen(80);
	upload = require("express-fileupload");
app.use(upload())
console.log("Server started! ");
app.get('/',function(req,res){
	res.sendFile(__dirname + "/upload.html");
})
app.post("/",function(req,res){
	if(req.files){
        var file = req.files.filename,
            filename = file.name;
        file.mv('./upload/' + filename,function(err){
            if(err){
                console.log(err)
                res.send("error occured")
            }else{
                res.send("Done!")
                fs.readFile('./upload/' + filename,'utf8',function(error,data){
                    console.log(data);
        
                });

            }
        })
		console.log(req.files)
	}
})
