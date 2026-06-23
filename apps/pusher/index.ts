import { prismaclient } from "store/client";
import { xAddBulk } from "redisstream/client";

async function main(){
    let websites = await prismaclient.website.findMany({
        select: {
            url: true,
            id: true
        }
    })
    
    console.log( websites.length)
    await xAddBulk(websites.map(w => ({
        url: w.url,
        id: w.id
    })))
}

setInterval(() => {
    main()
},3 * 1000 * 60)