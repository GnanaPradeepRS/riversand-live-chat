const { TeamsInfo, TurnContext , TeamsActivityHandler} = require("botbuilder");
const {Database} = require('./database');


class RSNotification extends TeamsActivityHandler{
    constructor(){
        super();

        this.onConversationUpdate(async (context , next) => {
            let convoRef = TurnContext.getConversationReference(context.activity);
            let team = await TeamsInfo.getMembers(context);
            this.addRow(convoRef , team);
            await next();
        })

        this.onMessage(async(context , next) => {
            await context.sendActivity(`Hi ${context.activity.from.name}, this bot is intended for sending workflow activity notifications only, mention in case if bot doesn't work as expected.`)
            await next();
        })

    }

    async addRow(convoRef , team){
        let dbConnection = await new Database().connection();
        
        let data = {
            convoRef : {
                serviceUrl : convoRef.serviceUrl,
                conversation : {
                    id : convoRef.conversation.id
                }
            },
            user : {
                id : "",
                name : "",
                aadObjectId : ""
            },
            email : "",
            _id : ""
        }

        for (let i = 0; i < team.length; i++) {
            const element = team[i];
            data.user.id = element.id;
            data.user.name = element.name;
            data.user.aadObjectId = element.aadObjectId;
            data.email = element.email.toLocaleLowerCase();
            data._id = convoRef.conversation.id + element.email.toLocaleLowerCase();
            dbConnection.insertOne(data , (err , res) => {
                // console.log(res);
            })
        }
    }
}

module.exports.RSNotification = RSNotification;