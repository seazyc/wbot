module.exports = {
	name: "culik",
	alias: ["test","rape"],
	category: "private",
	owner: true,
	desc: "Culik Members to group using invite url.",
	async exec({ sock, msg, args }) {
		const { from, sender, isGroup } = msg;
		try {
			const meta = isGroup ? await sock.groupMetadata(from) : "";
			const groupMem = isGroup ? meta.participants : "";
			const admin = isGroup ? getAdmin(groupMem) : "";
			const myID = sock.user.id.split(":")[0] + "@s.whatsapp.net";
			const cekAdmin = (m) => admin.includes(m);
			if (!isGroup) return await msg.reply("Only can be executed in group.");
			if (!cekAdmin(sender))
				return await msg.reply(
					`IND:\n${lang.indo.group.demote.noPerms}\n\nEN:\n${lang.eng.group.demote.noPerms}`
				);
			if (!cekAdmin(myID))
				return await msg.reply(
					`IND:\n${lang.indo.group.demote.botNoPerms}\n\nEN:\n${lang.eng.group.demote.botNoPerms}`
				);
			let url = args.join(" ").match(/chat.whatsapp.com\/([\w\d]*)/g)
			const code = url[0].replace("chat.whatsapp.com/", "")
			if (code === null) return await msg.reply("No invite url detected.");
			console.log(code)
			const result = await sock.groupGetInviteInfo(code)
			if (!result) return msg.reply(from, "URL Grup has been revoke")
			console.log(result.id)
			await sock.groupAcceptInvite(code)
			const fetchGroups = await sock.groupFetchAllParticipating()
			const getGroups = Object.entries(fetchGroups).slice(0).map(entry => entry[1])
			const participants = getGroups.filter((v) => v.id === result.id).map((x) => x.participants)[0].map((v) => v.id)
			if (participants === undefined) return msg.reply(from, "This bot not join in this group")
			await sock.groupParticipantsUpdate(from, participants, 'add').catch((e) => console.log(e))
		} catch (e) {
			console.log(e)
			await msg.reply("Terjadi Kesalahan")
		}
	},
};

function getAdmin(participants) {
	let admins = new Array();
	for (let ids of participants) {
		!ids.admin ? "" : admins.push(ids.id);
	}
	return admins;
}
