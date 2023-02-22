require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
    {
        name: "add_task",
        description: "Adds a task to the queue.",
        options: [
            {
                name: "task_name",
                description: "The name of the task.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: "finish_current",
        description: "Finish the top priority task in the queue",
    },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("Slash commands were registered successfully!");
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();
