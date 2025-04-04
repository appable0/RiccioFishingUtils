//This code is responsible for tracking the party joins/leave/transfers etc.

import { playerData } from "../../data/data";
import { playerName } from "../../data/constants";
import { checkIfUser, removeFromArray, removeRankTag } from "../../utils/functions";

class partyTracker {
    constructor() {
        this.PARTY = playerData.PARTY


        this.logOff = playerData.PARTY.logOff??564004800000
        this.inParty = playerData.PARTY.inParty??false
        this.isLeader = playerData.PARTY.isLeader??false
        this.membersSet = new Set(playerData.PARTY.members??[])
        this.warpExcluded = playerData.PARTY.warpExcluded??[]

        var lastValues = { 
            logOff: this.logOff,
            inParty: this.inParty,
            isLeader: this.isLeader,
            members: this.members,
            warpExcluded: this.warpExcluded
        }
        const logger = register('step', () => {
            Object.keys(lastValues).forEach((value) => {
                if(lastValues[value] != this[value]) {
                    if(value === 'members') {
                        let equal = true
                        lastValues[value].forEach((value, index) => {
                            if(this.members[index] != value) equal = false
                        })
                        if(equal) return
                    }
                    ChatLib.chat(`${value}: ${lastValues[value]} -> ${this[value]}`)
                    lastValues[value] = this[value]
                }
            })
        }).unregister()

        register("chat", () => {
            this.inParty = true;
        }).setCriteria("Party > ${*}: ${*}");
        
        register("chat", (user) => {
            this.inParty = true;
            this.membersSet.clear()
            this.membersSet.add(removeRankTag(user))
        }).setCriteria("You have joined ${user}'s party!");
        
        register("chat", (user) => {
            this.inParty = true;
            this.membersSet.clear()
            this.membersSet.add(removeRankTag(user))
        }).setCriteria("You have joined ${user}' party!");
        
        register("chat", (people) => {
            this.inParty = true;
            if(people.includes(", ")) people = people.split(", ").map((name) => {return removeRankTag(name)})
            else people = [removeRankTag(people)]
            people.forEach((person) => {
                this.membersSet.add(person)  
            })
        }).setCriteria("You'll be partying with: ${people}");
        
        register("chat", (user) => {
            this.inParty = true;
            if(!checkIfUser(user)) {
                this.membersSet.clear()
                this.membersSet.add(removeRankTag(user))
            }
            else this.isLeader = true
        }).setCriteria("Party Leader: ${user} ●");
        
        register("chat", (people) => {
            this.inParty = true;
            people = people.split(" ● ").filter(name => name).map((name) => {return removeRankTag(name)})
            people.forEach((person) => {
                if(person != "" && person != playerName) this.membersSet.add(person)    
            })
        }).setCriteria("Party Moderators: ${people}");
        
        register("chat", (people) => {
            this.inParty = true;
            people = people.split(" ● ").filter(name => name).map((name) => {return removeRankTag(name)})
            people.forEach((person) => {
                if(person != "" && person != playerName) this.membersSet.add(person)  
            })
        }).setCriteria("Party Members: ${people}");
        
        register("chat", (user) => {
            if(user.includes(">")) return
            if(!this.inParty) {
                if(checkIfUser(removeRankTag(user))) {
                    this.isLeader = true;
                }
            }
            this.inParty = true;
        }).setCriteria("${user} invited ${*} to the party! They have 60 seconds to accept.");
        
        register("chat", (user) => {
            if(user.includes(">")) return
            this.inParty = true;
            this.membersSet.add(removeRankTag(user))
        }).setCriteria("${user} joined the party.");
        
        register("chat", (user) => {
            this.inParty = true;
            this.isLeader = true;
        }).setCriteria("Created a public party! Players can join with /party join ${user}");
        
        register("chat", () => {
            this.inParty = true;
            this.isLeader = false;
        }).setCriteria("You are not this party's leader!");
        
        register("chat", () => {
            this.inParty = false;
            this.isLeader = false;
            this.membersSet.clear()
            this.warpExcluded = [];
        }).setCriteria("You left the party.");
        
        register("chat", () => {
            this.inParty = false;
            this.isLeader = false;
            this.membersSet.clear()
            this.warpExcluded = [];
        }).setCriteria("You have been kicked from the party by ${*}");
        
        register("chat", () => {
            this.inParty = false;
            this.isLeader = false;
            this.membersSet.clear()
            this.warpExcluded = [];
        }).setCriteria("The party was disbanded because all invites expired and the party was empty.");
        
        register("chat", () => {
            this.inParty = false;
            this.isLeader = false;
            this.membersSet.clear()
            this.warpExcluded = [];
        }).setCriteria("The party was disbanded because the party leader disconnected.");
        
        register("chat", (user) => {
            if(user.includes(">")) return
            this.inParty = false;
            this.isLeader = false;
            this.membersSet.clear()
            this.warpExcluded = [];
        }).setCriteria("${user} has disbanded the party!");
        
        register("chat", () => {
            this.inParty = false;
            this.isLeader = false;
            this.membersSet.clear()
            this.warpExcluded = [];
        }).setCriteria("You are not in a party right now.");
        
        register("chat", (user, user2) => {
            this.inParty = true;
            if(checkIfUser(removeRankTag(user))) {
                this.isLeader = true;
            }
            else if (checkIfUser(removeRankTag(user2))) {
                this.isLeader = false;
            }
        }).setCriteria("The party was transferred to ${user} by ${user2}");
        
        register("chat", (user, user2) => {
            if(checkIfUser(removeRankTag(user))) {
                this.isLeader = true;
                this.inParty = true;
            }
            else if (checkIfUser(removeRankTag(user2))) {
                this.isLeader = false;
                this.inParty = false;
                this.membersSet.clear()
                this.warpExcluded = [];
                return
            }
            this.membersSet.delete(removeRankTag(user2))
        }).setCriteria("The party was transferred to ${user} because ${user2} left");
        
        register("chat", (user) => {
            if(user.includes(">")) return
            this.membersSet.delete(removeRankTag(user))
            if(this.warpExcluded.includes(removeRankTag(user))) removeFromArray(this.warpExcluded, removeRankTag(user));
        }).setCriteria("${user} has left the party.");
        
        register("chat", (user) => {
            if(user.includes(">")) return
            this.membersSet.delete(removeRankTag(user))
            if(this.warpExcluded.includes(removeRankTag(user))) removeFromArray(this.warpExcluded, removeRankTag(user));
        }).setCriteria("${user} was removed from your party because they disconnected.");
        
        register("chat", (user) => {
            if(user.includes(">")) return
            this.membersSet.delete(removeRankTag(user))
        }).setCriteria("${user} has been removed from the party.");
        
        register("messageSent", (message) => {
            const result = /\/^p kick (.+)$/.exec(message)
            if(result) {
                let user = result[1]
                if(this.warpExcluded.includes(removeRankTag(user))) removeFromArray(this.warpExcluded, removeRankTag(user));
            }
        })
        
        register("worldunload", () => {
            this.logOff = Date.now();
        });
        
        register("gameunload", () => {
            this.save();
        });
        
        register("worldload", () => {
            if (this.inParty){
                if (this.logOff + 300000 < Date.now()){
                    this.inParty = false;
                    this.isLeader = false;
                    this.membersSet.clear()
                    this.warpExcluded = [];
                }
            }
        });

        register("command", () => {
            ChatLib.chat(JSON.stringify({
                logOff: this.logOff,
                inParty: this.inParty,
                isLeader: this.isLeader,
                members: this.members,
                warpExcluded: this.warpExcluded
            }, null, 4))
        }).setName("rfupartyinfo")

        let loggerEnabled = false
        register("command", () => {
            if(loggerEnabled) {
                logger.unregister()
                loggerEnabled = false
            }
            else {
                logger.register()
                loggerEnabled = true
            }
        }).setName("rfutogglelogger")
    }

    get members() {
        return [...this.membersSet]
    }

    save() {
        playerData.PARTY = {
            logOff: this.logOff,
            inParty: this.inParty,
            isLeader: this.isLeader,
            members: this.members,
            warpExcluded: this.warpExcluded
        }
        playerData.save()
    }
}

export default new partyTracker()