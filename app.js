const PROJECTS_FILE = "./data/projects.json";

const projectsGrid = document.querySelector("#projects-grid");
const filtersContainer = document.querySelector("#project-filters");

let projects = [];
let activeCategory = "All";

function escapeHTML(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short"
  }).format(new Date(dateString));
}

function createProjectCard(project) {
  const topics = Array.isArray(project.topics)
    ? project.topics.slice(0, 5)
    : [];

  const tags = topics
    .map((topic) => `<span>${escapeHTML(topic)}</span>`)
    .join("");

  const homepage = project.homepage
    ? `
      <a
        href="${escapeHTML(project.homepage)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Live demo ↗
      </a>
    `
    : "";

  return `
    <article class="project-card">

      <div class="project-top">
        <span class="project-category">
          ${escapeHTML(project.category || "Project")}
        </span>

        <span class="project-language">
          ${escapeHTML(project.language || "—")}
        </span>
      </div>

      <h3>${escapeHTML(project.display_name)}</h3>

      <p>
        ${escapeHTML(
          project.description || "A technical project by Arnun Polsuksiri."
        )}
      </p>

      <div class="project-bottom">

        ${
          tags
            ? `<div class="project-tags">${tags}</div>`
            : ""
        }

        <div class="project-links">

          <a
            href="${escapeHTML(project.github_url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>

          ${homepage}

        </div>

      </div>

    </article>
  `;
}

function renderFilters() {
  const categories = [
    "All",
    ...new Set(
      projects
        .map((project) => project.category)
        .filter(Boolean)
    )
  ];

  filtersContainer.innerHTML = categories
    .map(
      (category) => `
        <button
          type="button"
          class="filter-button ${
            category === activeCategory ? "active" : ""
          }"
          data-category="${escapeHTML(category)}"
        >
          ${escapeHTML(category)}
        </button>
      `
    )
    .join("");

  filtersContainer
    .querySelectorAll(".filter-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        renderFilters();
        renderProjects();
      });
    });
}

function renderProjects() {
  const visibleProjects =
    activeCategory === "All"
      ? projects
      : projects.filter(
          (project) => project.category === activeCategory
        );

  if (visibleProjects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state">
        No projects found in this category.
      </div>
    `;

    return;
  }

  projectsGrid.innerHTML = visibleProjects
    .map(createProjectCard)
    .join("");
}

async function loadProjects() {
  try {
    const response = await fetch(PROJECTS_FILE);

    if (!response.ok) {
      throw new Error(
        `Unable to load project data (${response.status}).`
      );
    }

    const data = await response.json();

    projects = Array.isArray(data.projects)
      ? data.projects
      : [];

    renderFilters();
    renderProjects();

  } catch (error) {
    console.error(error);

    projectsGrid.innerHTML = `
      <div class="empty-state">
        <strong>Projects could not be loaded.</strong>
        <br />
        Please check the project data configuration.
      </div>
    `;
  }
}

loadProjects();