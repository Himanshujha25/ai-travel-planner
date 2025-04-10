const axios = require("axios");

exports.travelPlanner = async (req, res) => {
  try {
    const { destination, startDate, endDate, interests, budget } = req.body;

    if (!destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const prompt = `
Create a personalized travel itinerary for a trip to ${destination} from ${startDate} to ${endDate}.
The traveler's total budget is ${budget} USD. Interests: ${interests || "general tourism"}.

Format:
Day X: Activity 1 (estimated cost), Activity 2 (estimated cost), etc.

Guidelines:
- Stay within the budget
- Include top attractions & hidden gems
- Suggest food, transport, and local tips
- Mention estimated cost in USD after each activity
- Ensure total cost doesn’t exceed budget
`;

    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: "You are a helpful travel planner assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const plan =
      response.data?.choices?.[0]?.message?.content ||
      response.data?.choices?.[0]?.content;

    if (!plan) {
      console.error("❌ No plan content found in response:", response.data);
      return res.status(500).json({ message: "No itinerary received from AI." });
    }

    res.status(200).json({ travelPlan: plan });
  } catch (error) {
    console.error("❌ Error generating travel plan:");
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ message: "Failed to generate travel plan." });
  }
};
