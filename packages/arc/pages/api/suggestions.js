import { data } from "../../static/example_data";
const suggestions = data?.suggestions;

export default function Suggestions(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(suggestions));
}
