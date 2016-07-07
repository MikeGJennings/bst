import {Global} from "./global";
import {Socket} from "net";
export interface OnMessage {
    (message: string): void;
}

export interface OnConnect {
    (): void;
}

export class SocketHandler {
    public message: string = null;

    public constructor (private socket: Socket, private onMessage: OnMessage) {
        let self = this;

        // Add a 'data' event handler to this instance of socket
        this.socket.on('data', function(data: Buffer) {
            console.log('DATA READ ' + self.socket.remoteAddress + ': ' + data);

            if (self.message == null) {
                self.message = "";
            }

            let dataString: string = data.toString();
            if (dataString.indexOf(Global.MessageDelimiter) == -1) {
                self.message += dataString;
            } else {
                let completeMessage = dataString.substr(0, dataString.indexOf(Global.MessageDelimiter));
                //console.log("FullMessage: " + completeMessage);
                self.onMessage(completeMessage);
                self.message = null;
            }
        });
    }

    public send(message: string) {
        let self = this;
        //console.log("SendingMessage: " + message);
        //Use TOKEN as message delimiter
        message = message + Global.MessageDelimiter;
        this.socket.write(message, function() {
            console.log("DATA SENT " + self.remoteAddress() + ": " + message);
        });
    }

    public call(message: string, onReply: OnMessage) {
        //console.log("CallingWith: " + message);
        this.onMessage = onReply;
        this.send(message);
    }

    public remoteAddress (): string {
        return this.socket.remoteAddress;
    }
}
