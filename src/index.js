require("dotenv").config();
const cron = require("cron");
const { Client, IntentsBitField } = require("discord.js");

const { BOT_ID, JOSH_ID, CHANNEL_ID } = process.env;

const TASK_COMPLETE_ENDING = " - DONE!";

const BEGINNING_TASKS = [
    "stream a finance thing",
    "do PS/IL/Proc Related",
    "45 min learn AE",
];

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on("ready", (c) => {
    console.log(`✅ ${c.user.tag} is online.`);

    // if it's 7am... i.e. "0 7 * * *"
    const initial_setup_cron = new cron.CronJob("0 7 * * *", async () => {
        // throw
        // stream + drawing + animating
        // on the plate
        console.log("Throwing today's initial tasks on the plate!");
        for (const task of BEGINNING_TASKS) {
            client.channels.cache.get(CHANNEL_ID).send(task);
        }
    });

    // When you want to start it, use:
    initial_setup_cron.start();

    // if it's 8am through 5pm, (i.e. "0 8-17 * * *")
    let scheduledMessage = new cron.CronJob("0 8-17 * * *", async () => {
        // find the latest one that doesn't appear twice, ask about it
        const task = await getCurrentTask();

        // DM: Hey, it's time to do task
        client.users.fetch(JOSH_ID, false).then((user) => {
            console.log("TASK: ", task);
            user.send(`Do this task: ${task}`);
        });
    });

    // When you want to start it, use:
    scheduledMessage.start();
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "add_task") {
        const task = interaction.options.get("task_name").value;
        interaction.reply(`${task}`);
    }
    if (interaction.commandName === "finish_current") {
        const task = await getCurrentTask();
        interaction.reply(`${task}${TASK_COMPLETE_ENDING}`);
    }
});

client.login(process.env.TOKEN);

async function getCurrentTask(userID = BOT_ID, channelID = CHANNEL_ID) {
    const channel = client.channels.cache.get(channelID);
    const messages = await channel.messages.fetch({ limit: 100 });
    const messagesArray = [...messages];
    const messagesToday = messagesArray.filter((message) =>
        isTimeStampToday(message)
    );
    const messagesTodayByUser = messagesToday.filter(
        (message) => message[1].author.id === userID
    );
    const undone_tasks = getTasksWithoutDONE(messagesTodayByUser);
    console.log("undone_tasks: ");
    console.log(undone_tasks);
    console.log("");
    const highest_priority_task = undone_tasks[undone_tasks.length - 1];
    console.log("highest_priority_task: ");
    console.log(highest_priority_task);
    console.log("");
    const content = highest_priority_task[1].content;
    console.log("content: ");
    console.log(content);
    console.log("");
    return content;
}

function getTasksWithoutDONE(messages) {
    console.log("messages: ");
    console.log(messages);
    console.log("");
    const complete_tasks = messages
        .filter((message) => message[1].content.endsWith(TASK_COMPLETE_ENDING))
        .map((message) => message[1].content);
    console.log("complete_tasks: ");
    console.log(complete_tasks);
    console.log("");
    const complete_task_without_done = complete_tasks.map((task) =>
        task.replace(TASK_COMPLETE_ENDING, "")
    );
    console.log("complete_task_without_done: ");
    console.log(complete_task_without_done);
    console.log("");
    const redundant_tasks = complete_tasks.concat(complete_task_without_done);
    console.log("redundant_tasks: ");
    console.log(redundant_tasks);
    console.log("");
    if (redundant_tasks.length > 0) {
        return messages.filter(
            (message) => redundant_tasks.indexOf(message[1].content) === -1
        );
    } else {
        return messages;
    }
}

async function userMessagesInChannelToday(
    userID = JOSH_ID,
    channelID = CHANNEL_ID
) {
    const channel = client.channels.cache.get(channelID);
    const messages = await channel.messages.fetch({ limit: 100 });
    const messagesArray = [...messages];
    const messagesToday = messagesArray.filter((message) =>
        isTimeStampToday(message)
    );
    const messagesTodayByUser = messagesToday.filter(
        (message) => message[1].author.id === userID
    );
    return messagesTodayByUser.map((message) => message[1].content);
}

function isTimeStampToday(message) {
    const createdTimestamp = message[1]["createdTimestamp"];
    const today = new Date().setHours(0, 0, 0, 0);
    const timestampDay = new Date(createdTimestamp).setHours(0, 0, 0, 0);
    return today === timestampDay;
}
