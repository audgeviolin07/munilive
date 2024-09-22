"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import Image from 'next/image';
import { InferenceEngine, CVImage } from "inferencejs"; // Roboflow imports

const cerebras = new Cerebras({
  apiKey: process.env.NEXT_PUBLIC_CEREBRAS_API_KEY,
});

export default function Dashboard() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Hello! How are you feeling today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inferEngine = useMemo(() => new InferenceEngine(), []);
  const [modelWorkerId, setModelWorkerId] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

  // Roboflow initialization and webcam handling
  useEffect(() => {
    const startWebcam = () => {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: 320, height: 180, facingMode: "environment" } // Smaller video size
      }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Ensure that video dimensions are set after the metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
            }
            detectFrame();
          };
        }
      }).catch((error) => {
        console.error("Error accessing webcam: ", error);
      });
    };

    if (!modelLoading) {
      setModelLoading(true);
      inferEngine.startWorker("coco", 3, "rf_EsVTlbAbaZPLmAFuQwWoJgFpMU82")
        .then((id) => setModelWorkerId(id));
    }
    
    if (modelWorkerId) {
      startWebcam();
    }
  }, [inferEngine, modelWorkerId, modelLoading]);

  const detectFrame = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setTimeout(detectFrame, 100); // Retry until video is ready
      return;
    }
  
    const img = new CVImage(videoRef.current);
  
    if (modelWorkerId) { // Ensure modelWorkerId is not null
      inferEngine.infer(modelWorkerId, img).then((predictions) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) return;
  
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
        predictions.forEach((prediction) => {
          const { x, y, width, height } = prediction.bbox;
  
          // Draw bounding box
          ctx.strokeStyle = prediction.color;
          ctx.strokeRect(x - width / 2, y - height / 2, width, height);
  
          // Set font size larger for the labels
          ctx.font = "20px monospace"; // Increase font size for label text
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillText(`${prediction.class} ${Math.round(prediction.confidence * 100)}%`, x - width / 2, y - height / 2 - 10);
        });
  
        setTimeout(detectFrame, 100 / 3);
      }).catch((error) => {
        console.error("Error during inference: ", error);
      });
    } else {
      console.error("ModelWorkerId is null");
    }
  };
  

  // Cerebras chatbot integration
  const handleSend = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      try {
        const stream = await cerebras.chat.completions.create({
          messages: [
            {
              role: "system",
              content: 'You are a doctor\'s assistant named "health assistant". Ask about their condition and track health metrics like blood pressure. Ensure they are adhering to treatment plans.',
            },
            {
              role: "user",
              content: input,
            },
          ],
          model: "llama3.1-8b",
          stream: true,
          max_tokens: 1024,
          temperature: 1,
          top_p: 1,
        });

        let accumulatedMessage = "";

        for await (const chunk of stream) {
          if (chunk?.choices && chunk.choices.length > 0) {
            const content = chunk.choices[0]?.delta?.content || '';
            accumulatedMessage += content;
          }
        }

        setMessages((prev) => [...prev, { text: accumulatedMessage, sender: "bot" }]);

      } catch (error) {
        console.error("Error with Cerebras chat:", error);
        setMessages((prev) => [...prev, { text: "Sorry, there was an error with the assistant.", sender: "bot" }]);
      }
    }
  };

  // Wolfram chart fetching
  const fetchWolframChart = async () => {
    try {
      const response = await fetch('http://localhost:4000/wolfram');
      const data = await response.json();
      const imageUrl = data.queryresult.pods[0].subpods[0].img.src;
      setChartUrl(imageUrl);
    } catch (error) {
      console.error("Error fetching Wolfram chart:", error);
    }
  };

  return (
    <div className="flex justify-center items-start space-x-8 p-8">
      {/* First Card - Daily Check-in */}
      <Card className="w-full max-w-2xl h-[80vh] bg-white bg-opacity-20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">Daily Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-[60vh] overflow-y-auto space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-white bg-opacity-20 text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-grow bg-white bg-opacity-20 text-white placeholder-gray-300"
              />
              <Button onClick={handleSend} className="bg-white text-purple-600 hover:bg-gray-100">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Column with Webcam and Wolfram Cards */}
      <div className="flex flex-col space-y-8">
        {/* Second Card - Roboflow Webcam */}
        <Card className="w-full max-w-2xl h-[40vh] bg-white bg-opacity-20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">Roboflow Pain Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
            <video ref={videoRef} width="475" height="300" className="rounded-lg" style={{ position: "relative" }} />
              <canvas ref={canvasRef} width="400" height="240" style={{ position: "absolute", top: 50, left: 50 }} />
            </div>
          </CardContent>
        </Card>

        {/* Third Card - Wolfram Blood Pressure Plot and Pain Level */}
        <Card className="w-full max-w-2xl h-[40vh] bg-white bg-opacity-20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">Wolfram Blood Pressure Plot and Pain Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[30vh] flex justify-center items-center">
              {chartUrl ? (
                <Image
                  src={chartUrl}
                  alt="Wolfram Blood Pressure Plot"
                  width={500}
                  height={500}
                  className="object-contain"
                />
              ) : (
                <Button onClick={fetchWolframChart} className="bg-white text-purple-600 hover:bg-gray-100">
                  Fetch Wolfram Chart
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// "use client"
// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Send } from "lucide-react"
// import Webcam from "react-webcam"
// import Cerebras from '@cerebras/cerebras_cloud_sdk';
// import Image from 'next/image';  // Importing Image from next/image

// const cerebras = new Cerebras({
//   apiKey: process.env.NEXT_PUBLIC_CEREBRAS_API_KEY
// });

// export default function Dashboard() {
//   const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
//     { text: "Hello! How are you feeling today?", sender: "bot" },
//   ])
//   const [input, setInput] = useState("")
//   const [chartUrl, setChartUrl] = useState<string | null>(null)

//   const fetchWolframChart = async () => {
//     try {
//       const response = await fetch('http://localhost:4000/wolfram');
//       const data = await response.json();
//       const imageUrl = data.queryresult.pods[0].subpods[0].img.src;
//       setChartUrl(imageUrl);
//     } catch (error) {
//       console.error("Error fetching Wolfram chart:", error);
//     }
//   };

//   const handleSend = async () => {
//     if (input.trim()) {
//       setMessages([...messages, { text: input, sender: "user" }]);
//       setInput("");
  
//       // Call Cerebras API to get bot response
  //     try {
  //       const stream = await cerebras.chat.completions.create({
  //         messages: [
  //           {
  //             role: "system",
  //             content:
  //               'you are a doctor\'s assistant - your name is "health assistant". don\'t introduce yourself. isn\'t an appointment. this is just an AI assistant gaining metrics. Ask about their disease and gain metrics (ex. blood pressure) to see if they are making progress. Ensure the patient is adhering to treatment regimes.'
  //           },
  //           {
  //             role: "user",
  //             content: input,
  //           },
  //         ],
  //         model: "llama3.1-8b",
  //         stream: true,
  //         max_tokens: 1024,
  //         temperature: 1,
  //         top_p: 1,
  //       });
  
  //       // Buffer for accumulating the bot response
  //       let accumulatedMessage = "";
  
  //       for await (const chunk of stream) {
  //         if (chunk?.choices && chunk.choices.length > 0) {
  //           const content = chunk.choices[0]?.delta?.content || '';
  //           accumulatedMessage += content;
  //         }
  //       }
  
  //       // Once the message stream is complete, update the final message
  //       setMessages((prev) => [...prev, { text: accumulatedMessage, sender: "bot" }]);
  
  //     } catch (error) {
  //       console.error("Error with Cerebras chat:", error);
  //       setMessages((prev) => [...prev, { text: "Sorry, there was an error with the assistant.", sender: "bot" }]);
  //     }
  //   }
  // };

//   return (
//     <div className="flex justify-center items-start space-x-8 p-8">
//       {/* First Card - Daily Check-in */}
//       <Card className="w-full max-w-2xl h-[80vh] bg-white bg-opacity-20 backdrop-blur-lg">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-white text-center">Daily Check-in</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="h-[60vh] overflow-y-auto space-y-4 p-4">
//               {messages.map((message, index) => (
//                 <div
//                   key={index}
//                   className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`rounded-lg px-4 py-2 max-w-[80%] ${
//                       message.sender === "user"
//                         ? "bg-purple-600 text-white"
//                         : "bg-white bg-opacity-20 text-white"
//                     }`}
//                   >
//                     {message.text}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="flex space-x-2">
//               <Input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && handleSend()}
//                 placeholder="Type your message..."
//                 className="flex-grow bg-white bg-opacity-20 text-white placeholder-gray-300"
//               />
//               <Button onClick={handleSend} className="bg-white text-purple-600 hover:bg-gray-100">
//                 <Send className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Second Column with Webcam and Wolfram Cards */}
//       <div className="flex flex-col space-y-8">
//         {/* Second Card - Webcam for Computer Vision Model */}
//         <Card className="w-full max-w-2xl h-[40vh] bg-white bg-opacity-20 backdrop-blur-lg">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold text-white text-center">Roboflow Pain Analysis</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[30vh] flex justify-center items-center">
//               <Webcam
//                 className="w-full h-full rounded-lg"
//                 audio={false}
//                 screenshotFormat="image/jpeg"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Third Card - Wolfram Blood Pressure Plot and Pain Level */}
//         <Card className="w-full max-w-2xl h-[40vh] bg-white bg-opacity-20 backdrop-blur-lg">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold text-white text-center">Wolfram Blood Pressure Plot and Pain Level</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[30vh] flex justify-center items-center">
//               {chartUrl ? (
//                 <Image
//                   src={chartUrl}
//                   alt="Wolfram Blood Pressure Plot"
//                   width={500}  // Set an appropriate width
//                   height={500} // Set an appropriate height
//                   className="object-contain"
//                 />
//               ) : (
//                 <Button onClick={fetchWolframChart} className="bg-white text-purple-600 hover:bg-gray-100">
//                   Fetch Wolfram Chart
//                 </Button>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
