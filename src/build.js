const fs = require('fs');
const child_process = require('child_process');

files = [
    ['./src/index.ts', './dist'],
    ['./src/react_native/front/front.ts', './dist/lib'],
    ['./src/webview/back/back.ts', './dist/lib'],
    ['./src/index.ts', './build'],
    ['./src/react_native/front/front.ts', './build/lib'],
    ['./src/webview/back/back.ts', './build/lib']
]


new Promise(function(resolve, reject){
    let promises = []
    for(let i = 0; i < files.length; i++){
        promises.push(new Promise(function(resolve, reject){
            child_process.exec(`tsc ${files[i][0]} --outDir ${files[i][1]}`, function(err, stdout, stderr){
                if(err) reject(err);
                console.log(`building ${files[i][0]}`);
                resolve();
            });
        }));
    }
    Promise.all(promises).then(function(){
        resolve();
    }).catch(function(err){
        reject(err);
        throw err;
    });
}).then(function(){
    console.log('building androidjs webview sources');
    new Promise (function (resolve, reject){
        child_process.exec(`webpack --mode production`, function(err, stdout, stderr){
            if(err) {
                reject(err);
                throw err;
            }
            resolve();
        });
    }).then(function(){
        console.log('creating final androidjs');
        fs.readFile("./dist/webview/front/front.js", function(err, frontFile){
            if(err) throw(err);
            fs.readFile("./dist/webview/androidjs/androidjs.js", function(err, androidjsFile){
                if(err) throw(err);
                fs.writeFile("./dist/webview/androidjs.js", frontFile + androidjsFile, function(err){
                    if(err) throw(err);
                    fs.writeFile("./build/lib/androidjs.js", frontFile + androidjsFile, function(err){
                        if(err) throw (err);
                        console.log("building done");
                    });
                })
            })
        })
    }).catch(function(err){
        throw err;
    })
}).catch(function(err){
    throw(err);
})