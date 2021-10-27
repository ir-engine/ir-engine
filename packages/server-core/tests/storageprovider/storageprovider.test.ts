import assert, { strictEqual } from 'assert'
import {useStorageProvider} from "../../src/media/storageprovider/storageprovider"
import fetch from "node-fetch"
import path from 'path';
const https = require('https');

describe('Storage Provider test', () => {
    const testFileName="TestFile.txt"
    const testFolderName="/TestFolder"
    const testFileContent="This is the Test File"

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
        assert.ok(await useStorageProvider().checkObjectExistence(fileKey))
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
        const url=(await useStorageProvider().getSignedUrl(fileKey,200,{})).url
        const httpAgent=new https.Agent({
            rejectUnauthorized:false,
        })
        const res=( fetch(url,{agent:httpAgent}))
        assert.ok((await res).ok)
        
    })

    it("should delete object",async function (){
        const fileKey=path.join(testFolderName,testFileName)
        assert.ok((await useStorageProvider().deleteResources([fileKey]))[0])
    })
})
