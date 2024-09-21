'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function HomeForm() {
  const [disease, setDisease] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Disease:", disease)
    console.log("Image:", image)
    // You would typically send this data to your API here
  }

  return (
    <Card className="w-full max-w-md bg-white/20 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white text-center">Welcome to muni</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disease" className="text-white">
              What condition are you managing?
            </Label>
            <Input
              id="disease"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              className="bg-white/20 text-white placeholder-gray-300"
              placeholder="e.g., Crohn's disease"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">
              Upload your medication label
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-white border-dashed rounded-lg cursor-pointer bg-gray-50/10 hover:bg-gray-50/20"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-white" />
                  <p className="mb-2 text-sm text-white">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-300">PNG, JPG, GIF up to 10MB</p>
                </div>
                <Input
                  id="image"
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full bg-white text-slate-600 hover:bg-gray-100">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}