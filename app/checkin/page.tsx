"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"
import Webcam from "react-webcam"

export default function Dashboard() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Hello! How are you feeling today?", sender: "bot" },
  ])
  const [input, setInput] = useState("")
  const [chartUrl, setChartUrl] = useState<string | null>(null)

  const apiKey = '6QAGPX-WGV2L9HTGG'

  const fetchWolframChart = async () => {
    try {
      // Use the CORS proxy
      const response = await fetch(
        `https://cors-anywhere.herokuapp.com/https://api.wolframalpha.com/v2/query?input=3D%20blood%20pressure%20vs%20pain%20level&format=image&output=JSON&appid=${apiKey}`
      )
      const data = await response.json()
      const imageUrl = data.queryresult.pods[0].subpods[0].img.src
      setChartUrl(imageUrl)
    } catch (error) {
      console.error("Error fetching Wolfram chart:", error)
    }
  }

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }])
      setInput("")
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Thank you for sharing. Is there anything specific you'd like to discuss about your medication?", sender: "bot" },
        ])
      }, 1000)
    }
  }

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
        {/* Second Card - Webcam for Computer Vision Model */}
        <Card className="w-full max-w-2xl h-[40vh] bg-white bg-opacity-20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">Roboflow Pain Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[30vh] flex justify-center items-center">
              <Webcam
                className="w-full h-full rounded-lg"
                audio={false}
                screenshotFormat="image/jpeg"
              />
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
                <img src={chartUrl} alt="Wolfram Blood Pressure Plot" className="w-full h-full object-contain" />
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
  )
}
