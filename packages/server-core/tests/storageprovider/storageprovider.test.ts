import assert, { strictEqual } from 'assert'
import {useStorageProvider} from "../../src/media/storageprovider/storageprovider"
import fetch from "node-fetch"
import path from 'path';
const https = require('https');
import fs from "fs"
import appRootPath from 'app-root-path'

describe('Storage Provider test', () => {
    const testFileName="TestFile.txt"
    const testFolderName="/TestFolder"
    const testFileContent="This is the Test File"
    
    before(function(){
        const dir = path.join(appRootPath.path, `packages/server/upload`,testFolderName)
        if(fs.existsSync(dir))
            fs.rmSync(dir,{recursive:true})
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
        assert.ok(res.length===1 && res[0].name==="TestFile" && res[0].type==="txt")
    })

    it("should return valid object url",async function (){
        const fileKey=path.join(testFolderName,testFileName)
        const url=(await useStorageProvider().getSignedUrl(fileKey,2000,{})).url
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
        const folderKeyTemp=path.join(testFolderName,"temp")
        const folderKeyTemp2=path.join(testFolderName,"temp2")
        const fileKeyTemp=path.join(testFolderName,"temp",testFileName)

        const dir = path.join(appRootPath.path, `packages/server/upload`,folderKeyTemp)
        fs.mkdirSync(dir,{recursive:true})

        //check copy functionality
        await useStorageProvider().moveObject(fileKeyOriginal,folderKeyTemp,true)
        await assert.rejects(useStorageProvider().checkObjectExistence(fileKeyOriginal))
        await assert.rejects(useStorageProvider().checkObjectExistence(fileKeyTemp))

        //check move functionality
        const fileKeyTemp2=path.join(testFolderName,"temp2",testFileName)
        fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload`,folderKeyTemp2),{recursive:true})
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
        assert.ok((await useStorageProvider().deleteResources([fileKey]))[0])
    })



    after(function(){
        const dir = path.join(appRootPath.path, `packages/server/upload`,testFolderName)
        fs.rmSync(dir,{recursive:true})
    })
})
