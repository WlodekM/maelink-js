import { EventEmitter } from "node:events";

interface MessageArg {
    message: string,
    replyTo?: string
}

export default class MAELINK extends EventEmitter {
    private token: string | null = null;
    private _ws: WebSocket;
    private http: string;
    username?: string;

    get ws(): WebSocket {
        return this._ws
    }

    get(path: string, headers: Record<string, string> = {}) {
        console.log(this.http + path);
        if (this.token) headers = {...headers, token: this.token};
        return fetch(this.http + path, {
            headers,
        })
    }

    post(path: string, body: string | object, headers: Record<string, string> = {}) {
        console.log(this.http + path);
        if (this.token) headers = {...headers, token: this.token};
        if (typeof body == "object") {
            headers['content-type'] = 'application/json'
            body = JSON.stringify(body);
        }
        return fetch(this.http + path, {
            headers,
            body,
            method: 'POST'
        })
    }

    constructor (
        server: string = 'wss://maelink-ws.derpygamer2142.com', 
        http: string = 'https://maelink-http.derpygamer2142.com'
    ) {
        super()
        this._ws = new WebSocket(server)
        this.http = http
        // deno-lint-ignore no-this-alias
        const client = this;
        this._ws.addEventListener('message', function (ev) {
            const data = JSON.parse(ev.data);
            switch (data.cmd) {
                case 'post_home':
                    client.emit('post', data.post)
                    break;
            
                default:
                    break;
            }
        })
    }

    async login(username: string, password: string) {
        const resp = await this.post('/login', { username, password });
        if (resp.status != 200) throw 'Status not ok, status is ' + resp.status;
        const data = await resp.json()
        if (data.status !== 'success') throw 'Login failed: ' + data.message
        this.token = data.token
        this.username = username
        return data
    }

    sendMessage(message: string | MessageArg) {
        if (!this.token) throw 'You must be logged in to send messages'
        if (!message || typeof message == 'object' && message.message.length < 1) throw 'Message cannot be empty'
        this._ws.send(JSON.stringify({
            cmd: 'post',
            p: typeof message == 'object' ? message.message : message,
            token: this.token,
            reply_to: typeof message == 'object' ? message.replyTo : undefined
        }));
    }
}
