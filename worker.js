export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Bot is running!", { status: 200 });
    }

    const BOT_TOKEN = 'YOUR_BOT_TOKEN';
    const CHAT_ID = 'YOUR_CHAT_ID'; 

    const TOPIC_GAMBAR = 2; 
    const TOPIC_VIDEO = 4;  
    const TOPIC_DOKUMEN = 6;

    const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/`;

    try {
      const update = await request.json();
      const msg = update.message;

      if (!msg) return new Response("OK", { status: 200 });

      const messageId = msg.message_id;
      const currentThreadId = msg.message_thread_id || 0;

      // === FITUR 1: PERINTAH /cek ===
      if (msg.text === "/cek") {
        const payload = {
          chat_id: msg.chat.id,
          text: `🤖 SISTEM SORTIR AKTIF!\n\nChat ID Grup: ${msg.chat.id}\nTopic ID Ruangan ini: ${currentThreadId}`,
          message_thread_id: currentThreadId !== 0 ? currentThreadId : undefined
        };
        await fetch(API_URL + 'sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        return new Response("OK", { status: 200 });
      }

      // === FITUR 2: PERINTAH /status ===
      if (msg.text === "/status") {
        let gambar = parseInt(await env.MY_KV.get("gambar") || "0");
        let video = parseInt(await env.MY_KV.get("video") || "0");
        let dokumen = parseInt(await env.MY_KV.get("dokumen") || "0");
        let total = gambar + video + dokumen;

        const payload = {
          chat_id: msg.chat.id,
          text: `🟢 *Status Bot: ONLINE*\n\n📊 *Statistik File Tersortir:*\n🖼️ Gambar: ${gambar}\n🎥 Video: ${video}\n📁 Dokumen: ${dokumen}\n\n*Total Keseluruhan: ${total}*`,
          parse_mode: "Markdown",
          message_thread_id: currentThreadId !== 0 ? currentThreadId : undefined
        };
        await fetch(API_URL + 'sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        return new Response("OK", { status: 200 });
      }

      let targetTopic = null;
      let namaTopic = ""; 
      let fileId = null;
      let apiMethod = null;
      let fileParam = null;
      let kvKey = null; 

      if (msg.photo) {
        targetTopic = TOPIC_GAMBAR;
        namaTopic = "Gambar";
        fileId = msg.photo[msg.photo.length - 1].file_id; 
        apiMethod = "sendPhoto";
        fileParam = "photo";
        kvKey = "gambar";
      } else if (msg.video || (msg.document && msg.document.mime_type && msg.document.mime_type.includes('video/'))) {
        targetTopic = TOPIC_VIDEO;
        namaTopic = "Video";
        fileId = msg.video ? msg.video.file_id : msg.document.file_id;
        apiMethod = msg.video ? "sendVideo" : "sendDocument";
        fileParam = msg.video ? "video" : "document";
        kvKey = "video";
      } else if (msg.document && msg.document.mime_type && msg.document.mime_type.includes('image/')) {
        targetTopic = TOPIC_GAMBAR;
        namaTopic = "Gambar";
        fileId = msg.document.file_id;
        apiMethod = "sendDocument";
        fileParam = "document";
        kvKey = "gambar";
      } else if (msg.document) {
        targetTopic = TOPIC_DOKUMEN;
        namaTopic = "Dokumen";
        fileId = msg.document.file_id;
        apiMethod = "sendDocument";
        fileParam = "document";
        kvKey = "dokumen";
      }

      if (targetTopic !== null && targetTopic !== currentThreadId) {
        
        ctx.waitUntil((async () => {
          const date = new Date(Date.now() + 7 * 3600 * 1000);
          const tanggal = String(date.getUTCDate()).padStart(2, '0');
          
          const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const namaBulan = bulanIndo[date.getUTCMonth()];
          const tahun = date.getUTCFullYear();
          const hashtag = `#${namaTopic} #${tanggal}${namaBulan}${tahun}`;
          
          let captionBaru = msg.caption ? `${msg.caption}\n\n${hashtag}` : hashtag;

          const payloadSend = { 
            chat_id: CHAT_ID, 
            message_thread_id: targetTopic,
            caption: captionBaru 
          };
          payloadSend[fileParam] = fileId; 
          
          const resSend = await fetch(API_URL + apiMethod, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadSend) });
          const sendData = await resSend.json();
          
          if (sendData.ok) {
            
            if (kvKey) {
              let currentValue = parseInt(await env.MY_KV.get(kvKey) || "0");
              await env.MY_KV.put(kvKey, (currentValue + 1).toString());
            }

            const payloadDelete = { chat_id: CHAT_ID, message_id: messageId };
            await fetch(API_URL + 'deleteMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadDelete) });
            
            const payloadLapor = {
              chat_id: CHAT_ID,
              text: `✅ 1 File ${namaTopic} dipindahkan (+ Auto-Tag Tanggal).`,
              message_thread_id: currentThreadId !== 0 ? currentThreadId : undefined
            };
            
            const resLapor = await fetch(API_URL + 'sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadLapor) });
            const laporData = await resLapor.json();
            
            if (laporData.ok) {
              const pesanLaporId = laporData.result.message_id;
              await new Promise(resolve => setTimeout(resolve, 3000));
              const deleteLaporPayload = { chat_id: CHAT_ID, message_id: pesanLaporId };
              await fetch(API_URL + 'deleteMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(deleteLaporPayload) });
            }
          }
        })());
      }
    } catch (err) {
      console.error(err);
    }

    return new Response("OK", { status: 200 });
  }
};
