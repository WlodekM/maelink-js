import Maelink from "./main.ts";
import { username, password } from "./creds.json" with {type: "json"};

const ml = new Maelink()
console.log(
    await ml.login(username, password)
)

interface Post {
    _id: string,
    p: string,
    u: string,
    e: string,
    reply_to: null | string,
    post_id: string
}

// ml.ws.onmessage = e => console.log(e)

ml.on('post', ({p: post, _id}: Post) => {
    console.log(post)
    if (!post.startsWith(`@${username}`)) return;
    ml.sendMessage({
        message: 'hello',
        replyTo: _id
    }) 
})
