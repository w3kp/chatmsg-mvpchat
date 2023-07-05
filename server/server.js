import express from 'express'
import axios from 'axios';
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

const WEBHOOK_URL_PATH = '/vb/hook/cb';

// const setupChatBase = () => {
//   const fetch = require('node-fetch');

//   const url = 'https://www.chatbase.co/api/v1/chat';
//   const options = {
//     method: 'POST',
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: 'Bearer 5490468b-88be-4557-8afb-5cfef0715586'
//     },
//     body: JSON.stringify({
//       messages: [{role: 'user', content: 'Hi'}],
//       stream: false,
//       temperature: 0,
//       model: 'gpt-3.5-turbo',
//       chatbotId: 'DnPFpteoiEbc0jO4LorgM'
//     })
//   };

//   fetch(url, options)
//     .then(res => res.json())
//     .then(json => console.log(json))
//     .catch(err => console.error('error:' + err));

//   axios.post()
// }

const setViberWebhook = () => {
  const viberAuthToken = process.env.VIBER_AUTH_TOKEN; // Your Viber auth token
  const webhookUrl = `${process.env.TARGET_API_URL}${WEBHOOK_URL_PATH}`;

  const fetch = async () => {
    axios.post('https://chatapi.viber.com/pa/set_webhook', {
      "auth_token": viberAuthToken,
      "url": webhookUrl,
      "event_types": [
        "delivered",
        "seen",
        "failed",
        "subscribed",
        "unsubscribed",
        "conversation_started",
        "message"
      ],
      "send_name": true,
      "send_photo": true
    }, {
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        console.log('Webhook set successfully');
    }).catch(error => {
        console.error('Failed to set webhook', error);
    });
  }
  fetch();
}

app.post(WEBHOOK_URL_PATH, async (req, res) => {
  const event = req.body.event;
  console.log(req.body);
  
  // Here, we're assuming that chat messages come in with an event type of 'message'
  if (event === 'message') {
    const senderId = req.body.sender.id;
    const messageText = req.body.message.text;
    try {
      const response = await axios.post(process.env.TARGET_API_URL, req.body);
      // Send a message back to the user
      const messageResponse = await axios.post(`${process.env.VIBER_API_URL}/send_message`, {
        receiver: senderId,
        min_api_version: 1,
        sender: {
          name: "Chatmsg Guru",
          avatar: "https://i.pravatar.cc/150?img=63" // Change to your bot's avatar URL
        },
        tracking_data: "tracking data",
        type: "text",
        text: "Thank you for your message!" // Change to your desired response message
      }, {
        headers: {
          'X-Viber-Auth-Token': process.env.VIBER_AUTH_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      console.log({messageText});
      console.log({messageResponse});
      res.status(200).send('Webhook setting up webhook - processed successfully');
    } catch (err) {
      console.error('Error while forwarding to target API', err);
      res.status(500).send('Error while forwarding to target API');
    }
  } else {
    res.status(200).send('Webhook processed successfully');
  }
});

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "I want you to act as a document that I am having a conversation with. Your name is \"AI Assistant\". You will provide me with answers from the given info. If the answer is not included, say exactly \"Hmm, I am not sure.\" and stop after that. Refuse to answer any question not about the info. Never break character. \n\nQ: What is human life expectancy in the United States?\nA: Human life expectancy in the United States is 78 years.\n\nQ: Who was president of the United States in 1955?\nA: Dwight D. Eisenhower was president of the United States in 1955.\n\nQ: I have no internet connection using my Fiber\nA: Follow this simple checklist to troubleshoot your internet connection:\n1. Make sure that you are up to date with your account and you have no outstanding balance.\n2. Turn your modem ON and check if the POWER light indicator is steady green. If not, make sure that the modem is properly plugged in and check if there are any loose or damaged cables.\n3. Ensure that both ends of the patch cord is properly connected to the fiber optic slot at the back of the modem, and to the small box called the Inner Optical Outlet. The PON light indicator should be steady green if the patch cord is connected properly.\n4. If you are connected via WiFi, WLAN 2.4Ghz or 5Ghz light indicator should be steady green or blinking, if there is an ongoing data transmission. If not, turn your WiFi ON by pushing the button located at the side or back of your modem.\n5. If you are using LAN cable for your internet, LAN light indicator should be steady green or blinking, if there is an ongoing data transmission. If not, make sure that the LAN cable is not damaged or the LAN CARD/ETHERNET is enabled.\n6. To indicate successful internet connection, the INT/INTERNET light indicator should be blinking slowly or blinking fast, if you are actively browsing the internet.\n7. If any of the above light indicators are not in their normal state, turn your modem OFF for 5 minutes and then back ON to re-sync your modem with our network.\n8. If this does not resolve your concern, go to PLDT Home Support Page, click on Report A Service Issue, or send us a message on PLDT Home FB Messenger. Restoration of service may take 3-4 days.\n\nQ: How do I connect to my modem via LAN?\nA: \nFollow these easy steps to connect your modem via LAN:\n\nUsing the LAN Port 1 of your modem:\n\n1. Connect the Ethernet cable from the LAN Port 1 of your modem going to the LAN port of your PC or laptop.\n2. Check for the LAN icon on your PC or laptop if you are successfully connected and open your browser then you are ready to surf the net!\n\nUsing the LAN Port 2 or 3 of your modem:\n\n1. Connect the Ethernet cable from the LAN Port 2 or 3 port of your modem going to the LAN port of your PC or laptop.\n2. Your modem's LAN Port 2 or 3 light indicators should be blinking fast or slow. If not, your Ethernet cable or LAN port may be defective or disabled.\n3. Check for the LAN icon on your PC or laptop if you are successfully connected and open your browser then you are ready to surf the net!\n\nIf you further need assistance in connecting your modem via LAN, go to PLDT Home Support Page, click on Report A Service Issue, or send us a message on PLDT Home FB Messenger. Restoration of service may take 3-4 days.\n\nQ: " + prompt + "?\nA:",
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5001, () => {
  console.log('AI server started on http://localhost:5001');
  setViberWebhook();
})