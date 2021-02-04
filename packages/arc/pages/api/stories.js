import { data } from "../../static/example_data";
const stories = data?.stories;

export default function Stories(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(stories));
}
