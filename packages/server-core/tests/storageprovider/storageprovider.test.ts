import assert, { strictEqual } from 'assert'
import {useStorageProvider} from "../../src/media/storageprovider/storageprovider"
import fetch from "node-fetch"
import path from 'path';
const https = require('https');
import fs from "fs"
import appRootPath from 'app-root-path'
import AWS from 'aws-sdk';
import config from '../../src/appconfig'
import S3Provider from '../../src/media/storageprovider/s3.storage';

describe('Storage Provider test', () => {
    const testFileName="TestFile.txt"
    const testFolderName="TestFolder"
    const testFileContent="This is the Test File"
    const folderKeyTemp=path.join(testFolderName,"temp")
    const folderKeyTemp2=path.join(testFolderName,"temp2")
    

    before( async function(){
        if(config.server.storageProvider!=='aws'){
            //for local
            const dir = path.join(appRootPath.path, `packages/server/upload`,testFolderName)
            if(fs.existsSync(dir))
                fs.rmSync(dir,{recursive:true})


            const dir2 = path.join(appRootPath.path, `packages/server/upload`,folderKeyTemp)
            fs.mkdirSync(dir2,{recursive:true})
            fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload`,folderKeyTemp2),{recursive:true})


        }else{
            //for s3
            const provider=useStorageProvider().getProvider() as AWS.S3
            (useStorageProvider() as S3Provider).bucket="test-bucket-here"
            await provider.createBucket({Bucket:"test-bucket-here",ACL:""}).promise();
        }
    })

    it("should put object",function (){
        const fileKey=path.join(testFolderName,testFileName)
        const data=Buffer.from(testFileContent)
        useStorageProvider().putObject({
            Body:data,
            Key:fileKey,
            ContentType:"txt"
        })
    })

    it("should have object",async function (){
        const fileKey=path.join(testFolderName,testFileName)
        await assert.rejects(useStorageProvider().checkObjectExistence(fileKey))
    })

    it("should get object",async function (){
        const fileKey=path.join(testFolderName,testFileName)
        const body=(await useStorageProvider().getObject(fileKey)).Body
        assert.ok(body.toString()===testFileContent)
    })

    it("should list object",async function (){
        const res =await useStorageProvider().listFolderContent(testFolderName)

        let haveObject=false
        for(let i=0;i<res.length;i++){
            if(res[i].name==="TestFile" && res[i].type==="txt"){
                haveObject=true;
                break;
            }
        }
        assert.ok(haveObject)
    })

    it("should return valid object url",async function (){
        const fileKey=path.join("/",testFolderName,testFileName)
        const url=(await useStorageProvider().getSignedUrl(fileKey,20000,{})).url
        console.log("The Signed Url is:"+url)
        const httpAgent=new https.Agent({
            rejectUnauthorized:false,
        })
        let res
        try{
            res=await ( fetch(url,{agent:httpAgent}))
        }catch(err){
            console.log(err)
        }
        if(!res)
            console.log("Make sure server is running")
        assert.ok(res?.ok)
    })

    it("should be able to move/copy object",async function(){
        const fileKeyOriginal=path.join(testFolderName,testFileName)
        const fileKeyTemp=path.join(testFolderName,"temp",testFileName)
        const fileKeyTemp2=path.join(testFolderName,"temp2",testFileName)
        
        //check copy functionality
        await useStorageProvider().moveObject(fileKeyOriginal,folderKeyTemp,true)
        await assert.rejects(useStorageProvider().checkObjectExistence(fileKeyOriginal))
        await assert.rejects(useStorageProvider().checkObjectExistence(fileKeyTemp))

        //check move functionality
        await useStorageProvider().moveObject(fileKeyTemp,folderKeyTemp2)
        await assert.rejects(useStorageProvider().checkObjectExistence(fileKeyTemp2))
        await assert.doesNotReject(useStorageProvider().checkObjectExistence(fileKeyTemp))


    })

    it("should be able to rename object",async function(){
        const fileKeyTemp2=path.join(testFolderName,"temp2",testFileName)
        await useStorageProvider().moveObject(fileKeyTemp2,testFolderName,false,"Renamed.txt")
        const res =await useStorageProvider().listFolderContent(testFolderName)
        for(let i=0;i<res.length;i++){
            if(res[i].name==="Renamed"){
                assert.ok(true)
                return
            }
        }
        assert.ok(false)
    })

    it("should delete object",async function (){
        const fileKey=path.join(testFolderName,testFileName)
        assert.ok(await useStorageProvider().deleteResources([fileKey]))
    })
    
    
    
    after(async function(){
        if(config.server.storageProvider!=='aws'){
            const dir = path.join(appRootPath.path, `packages/server/upload`,testFolderName)
            fs.rmSync(dir,{recursive:true})
        }else{
            const provider=(useStorageProvider().getProvider()) as AWS.S3
            const object=await provider.listObjectsV2({Bucket:"test-bucket-here"}).promise()
            const promises=[]
            object.Contents.forEach((element)=>{
                promises.push(provider.deleteObject({Bucket:"test-bucket-here",Key:element.Key}).promise())
            })

            await Promise.all(promises)

            await (provider.deleteBucket({
                Bucket:"test-bucket-here",
            }).promise())
        }
    })

})
