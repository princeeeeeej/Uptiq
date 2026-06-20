import express from "express"
import {prismaclient} from "store/client"
import { AuthInput } from "./types";
import jwt from "jsonwebtoken"

const app = express();
app.use(express.json())

app.post("/website", async(req,res) => {
    if(!req.body.url){
        res.status(411).json({})
        return
    }
    const website = await prismaclient.website.create({
        data: {
            url: req.body.url, 
            timeAdded: new Date(),
            user_id: req.userId!
        }
    })

    res.json({
        id: website.id
    })
})

app.get("/status/:websiteId", async(req, res) => {
    const website = await prismaclient.website.findFirst({
        where:{
            user_id: req.userId,
            id: req.params.websiteId
        },
        include:{
            ticks: {
                orderBy: [{
                    created_at: 'desc'
                }]
                ,
                take: 1
            }
        }
    })

    if(!website){
        res.status(409).json({
            message: "Not found"
        })
        return
    }

    res.json({
        website
    })
})

app.post("/user/signup", async(req, res) => {
    const data = AuthInput.safeParse(req.body);
    if(!data.success){
        console.log(data.error)
        res.status(403).send("")
        return
    }
    try{
        let user = await prismaclient.user.create({
            data: {
                username: data.data.username,
                password: data.data.password
            }
        })
        res.json({
            id: user.id
        })
    }catch (e) {
    console.error("PRISMA ERROR:", e);
    res.status(500).json({
        error: String(e)
    });
}
})

app.post("/user/signin", async(req, res) => {
    const data = AuthInput.safeParse(req.body);
    if(!data.success){
        res.status(403).send("")
        return
    }

    let user = await prismaclient.user.findFirst({
        where: {
            username: data.data.username
        }
    })

    if(user?.password !== data.data.password){
        res.status(403).send("")
        return
    }

    let token = jwt.sign({
        sub: user.id
    }, process.env.JWT_SECRET!)

    res.json({
        jwt: token
    })
})

app.listen(3000);