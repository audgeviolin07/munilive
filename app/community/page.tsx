import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Community() {
  const experiences = [
    {
      name: "Alice",
      medication: "Infliximab",
      experience: "I've been using Infliximab for 6 months now, and it's made a significant difference in managing my Crohn's symptoms.",
    },
    {
      name: "Bob",
      medication: "Adalimumab",
      experience: "Adalimumab has been a game-changer for me. My flare-ups have reduced dramatically since starting this treatment.",
    },
    {
      name: "Charlie",
      medication: "Vedolizumab",
      experience: "I switched to Vedolizumab after other treatments stopped working. It took a few months, but I'm now seeing improvements.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-white bg-opacity-20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">Community Experiences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <Card key={index} className="bg-white bg-opacity-10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">{exp.name} - {exp.medication}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-200">{exp.experience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}