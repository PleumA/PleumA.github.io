const fs = require("fs");
const path = require("path");

const USERNAME = "PleumA";
const API_URL = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;

async function fetchRepositories() {
  const response = await fetch(API_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "PleumA-Portfolio"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

function getCategory(topics) {
  if (
    topics.some((topic) =>
      [
        "medical-ai",
        "machine-learning",
        "deep-learning",
        "computer-vision",
        "nlp"
      ].includes(topic)
    )
  ) {
    return "Medical AI";
  }

  if (
    topics.some((topic) =>
      ["research", "clinical-research"].includes(topic)
    )
  ) {
    return "Research";
  }

  if (
    topics.some((topic) =>
      ["software", "web-development"].includes(topic)
    )
  ) {
    return "Software";
  }

  if (
    topics.some((topic) =>
      ["data-science", "data-analysis"].includes(topic)
    )
  ) {
    return "Data Science";
  }

  return "Other";
}

function transformRepository(repo) {
  const topics = repo.topics || [];

  return {
    display_name: repo.name,
    description:
      repo.description || "No description provided.",
    github_url: repo.html_url,
    homepage: repo.homepage || null,
    language: repo.language || "Other",
    topics,
    category: getCategory(topics),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updated_at: repo.updated_at,
    featured: topics.includes("featured")
  };
}

async function main() {
  console.log(`Fetching public repositories for ${USERNAME}...`);

  const repositories = await fetchRepositories();

  const projects = repositories
    .filter((repo) => !repo.fork)
    .filter((repo) => (repo.topics || []).includes("portfolio"))
    .map(transformRepository)
    .sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  const output = {
    generated_at: new Date().toISOString(),
    username: USERNAME,
    projects
  };

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "projects.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2) + "\n"
  );

  console.log(`Found ${projects.length} portfolio project(s).`);
  console.log(`Written to: ${outputPath}`);

  projects.forEach((project) => {
    console.log(`- ${project.display_name} [${project.category}]`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
