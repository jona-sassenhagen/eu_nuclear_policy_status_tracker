const LIGHT_BG_STATUSES = new Set(["phase-out reverted", "pro-nuclear policy"]);

const STATUS_COLORS = {
  "no nuclear program": "#4b4f56",
  "phase-out in progress": "#c7442e",
  "phase-out completed": "#8a5a2b",
  "nuclear ban reconsidered": "#f07f2f",
  "phase-out reverted": "#d6b93d",
  "pro-nuclear policy": "#8bcf7a",
  "building new reactors": "#2f8f46"
};

const STATUS_PRIORITY = [
  "building new reactors",
  "pro-nuclear policy",
  "phase-out reverted",
  "nuclear ban reconsidered",
  "phase-out in progress",
  "phase-out completed",
  "no nuclear program"
];

const GEOJSON_COUNTRY_IDS = {
  AT: "AT",
  BE: "BE",
  BG: "BG",
  HR: "HR",
  CY: "CY",
  CZ: "CZ",
  DK: "DK",
  EE: "EE",
  FI: "FI",
  FR: "FR",
  DE: "DE",
  GR: "EL",
  HU: "HU",
  IE: "IE",
  IT: "IT",
  LV: "LV",
  LT: "LT",
  LU: "LU",
  MT: "MT",
  NL: "NL",
  PL: "PL",
  PT: "PT",
  RO: "RO",
  SK: "SK",
  SI: "SI",
  ES: "ES",
  SE: "SE"
};

const CONTEXT_COUNTRY_IDS = {
  UK: "UK",
  CH: "CH",
  NO: "NO",
  AL: "AL",
  BA: "BA",
  ME: "ME",
  MK: "MK",
  RS: "RS"
};

const KALININGRAD_POLYGON_INDEXES = [181, 182];
const THEME_STORAGE_KEY = "eu-nuclear-theme";

const EU_COUNTRY_CODES = Object.keys(GEOJSON_COUNTRY_IDS);
const EUROPE_BOUNDS = {
  minLon: -25,
  maxLon: 45,
  minLat: 32,
  maxLat: 72
};

async function loadCountries() {
  const response = await fetch("data/countries.json");
  if (!response.ok) {
    throw new Error("Failed to load dataset.");
  }

  const countries = await response.json();
  return countries
    .filter((country) => EU_COUNTRY_CODES.includes(country.countryCode))
    .sort((left, right) => left.countryName.localeCompare(right.countryName));
}

function formatDisplayDate(isoDate) {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
}

function getDatasetLastUpdated(countries) {
  const dates = countries.flatMap((country) => {
    const sourceDates = (country.sources || []).map((source) => source.accessedAt).filter(Boolean);
    const newsDates = (country.latestNews || []).map((item) => item.publishedAt).filter(Boolean);
    return [...sourceDates, ...newsDates];
  });

  return dates.sort().at(-1) || null;
}

function renderDatasetDate(countries) {
  const node = document.getElementById("dataset-date");
  if (!node) {
    return;
  }

  const lastUpdated = getDatasetLastUpdated(countries);
  node.textContent = lastUpdated ? formatDisplayDate(lastUpdated) : "the latest dataset update";
}

function getPreferredTheme() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.textContent = isDark ? "Light mode" : "Dark mode";
}

function initThemeToggle() {
  applyTheme(getPreferredTheme());

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

async function loadMapGeography() {
  const response = await fetch("assets/eu-countries.geojson");
  if (!response.ok) {
    throw new Error("Failed to load map geography.");
  }

  return response.json();
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || "var(--unknown)";
}

function resolvePrimaryStatus(country) {
  const signals = country.statusSignals;
  if (!signals) {
    return country.primaryStatus;
  }

  if (signals.buildingNewReactors) {
    return "building new reactors";
  }
  if (signals.proNuclearPolicy || signals.plannedNewReactors) {
    return "pro-nuclear policy";
  }
  if (signals.phaseOutReverted) {
    return "phase-out reverted";
  }
  if (signals.nuclearBanReconsidered || signals.phaseOutReconsidered) {
    return "nuclear ban reconsidered";
  }
  if (signals.phaseOutInProgress) {
    return "phase-out in progress";
  }
  if (signals.phaseOutCompleted) {
    return "phase-out completed";
  }
  if (signals.noNuclearProgram) {
    return "no nuclear program";
  }

  return country.primaryStatus;
}

function formatStatus(status) {
  return status || "unknown";
}

function createLegend() {
  const legend = document.getElementById("legend");
  if (!legend) {
    return;
  }

  STATUS_PRIORITY.forEach((status) => {
    const color = STATUS_COLORS[status];
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-swatch" style="background:${color}"></span>
      <span>${status}</span>
    `;
    legend.appendChild(item);
  });
}

function polygonBounds(points) {
  return points.reduce(
    (bounds, [lon, lat]) => ({
      minLon: Math.min(bounds.minLon, lon),
      maxLon: Math.max(bounds.maxLon, lon),
      minLat: Math.min(bounds.minLat, lat),
      maxLat: Math.max(bounds.maxLat, lat)
    }),
    { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity }
  );
}

function intersectsEurope(bounds) {
  return !(
    bounds.maxLon < EUROPE_BOUNDS.minLon ||
    bounds.minLon > EUROPE_BOUNDS.maxLon ||
    bounds.maxLat < EUROPE_BOUNDS.minLat ||
    bounds.minLat > EUROPE_BOUNDS.maxLat
  );
}

function extractPolygons(geometry) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }

  return [];
}

function filterEuropeanPolygons(geometry, countryCode = "") {
  return extractPolygons(geometry).filter((polygon) => {
    const outerRing = polygon[0] || [];
    if (outerRing.length === 0) {
      return false;
    }

    const bounds = polygonBounds(outerRing);
    if (!intersectsEurope(bounds)) {
      return false;
    }

    if (countryCode === "PT" && bounds.maxLon < -10.5) {
      return false;
    }

    return true;
  });
}

function projectPoint([lon, lat], scale, offsetX, offsetY) {
  return [offsetX + lon * scale, offsetY - lat * scale];
}

function createMapSvg(featuresByCode, contextEntries, countries) {
  const namespace = "http://www.w3.org/2000/svg";
  const padding = 8;
  const baseWidth = 920;
  const projectedBounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  };

  const preparedContext = contextEntries.map((entry) => {
    const polygons = entry.polygons || filterEuropeanPolygons(entry.feature?.geometry, entry.id);

    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lon, lat]) => {
          projectedBounds.minX = Math.min(projectedBounds.minX, lon);
          projectedBounds.maxX = Math.max(projectedBounds.maxX, lon);
          projectedBounds.minY = Math.min(projectedBounds.minY, -lat);
          projectedBounds.maxY = Math.max(projectedBounds.maxY, -lat);
        });
      });
    });

    return { entry, polygons };
  });

  const prepared = countries.map((country) => {
    const feature = featuresByCode.get(country.countryCode);
    const polygons = filterEuropeanPolygons(feature?.geometry, country.countryCode);

    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lon, lat]) => {
          projectedBounds.minX = Math.min(projectedBounds.minX, lon);
          projectedBounds.maxX = Math.max(projectedBounds.maxX, lon);
          projectedBounds.minY = Math.min(projectedBounds.minY, -lat);
          projectedBounds.maxY = Math.max(projectedBounds.maxY, -lat);
        });
      });
    });

    return { country, polygons };
  });

  const widthSpan = projectedBounds.maxX - projectedBounds.minX;
  const heightSpan = projectedBounds.maxY - projectedBounds.minY;
  const scale = (baseWidth - padding * 2) / widthSpan;
  const baseHeight = heightSpan * scale + padding * 2;
  const offsetX = padding - projectedBounds.minX * scale;
  const offsetY = padding - projectedBounds.minY * scale;

  const svg = document.createElementNS(namespace, "svg");
  svg.id = "eu-map";
  svg.classList.add("eu-map");
  svg.setAttribute("viewBox", `0 0 ${baseWidth} ${baseHeight}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Geographic map of EU countries");

  preparedContext.forEach(({ entry, polygons }) => {
    const group = document.createElementNS(namespace, "g");
    group.classList.add("context-country");
    group.setAttribute("aria-hidden", "true");
    group.dataset.contextCountry = entry.id;

    polygons.forEach((polygon) => {
      const path = document.createElementNS(namespace, "path");
      const d = polygon
        .map((ring) => {
          return ring
            .map((point, index) => {
              const [x, y] = projectPoint(point, scale, offsetX, offsetY);
              return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ")
            .concat(" Z");
        })
        .join(" ");
      path.setAttribute("d", d);
      group.appendChild(path);
    });

    svg.appendChild(group);
  });

  prepared.forEach(({ country, polygons }) => {
    const status = resolvePrimaryStatus(country);
    const group = document.createElementNS(namespace, "g");
    group.classList.add("country-shape");
    group.dataset.countryCode = country.countryCode;
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${country.countryName}: ${status}`);
    group.style.setProperty("--country-fill", getStatusColor(status));

    polygons.forEach((polygon) => {
      const path = document.createElementNS(namespace, "path");
      const d = polygon
        .map((ring) => {
          return ring
            .map((point, index) => {
              const [x, y] = projectPoint(point, scale, offsetX, offsetY);
              return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ")
            .concat(" Z");
        })
        .join(" ");
      path.setAttribute("d", d);
      group.appendChild(path);
    });

    svg.appendChild(group);
  });

  return svg;
}

function renderDetail(country) {
  const detail = document.getElementById("map-detail");
  if (!detail || !country) {
    return;
  }

  const status = resolvePrimaryStatus(country);
  const latestNews = country.latestNews[0];
  const badgeClass = LIGHT_BG_STATUSES.has(status) ? "status-badge is-light-bg" : "status-badge";
  const newsTitle = latestNews?.title
    ? latestNews.title.length > 55 ? latestNews.title.slice(0, 52) + "…" : latestNews.title
    : null;
  detail.style.setProperty("--detail-accent", getStatusColor(status));
  detail.innerHTML = `
    <h3>${country.flag} ${country.countryName}</h3>
    <span class="${badgeClass}" style="background:${getStatusColor(status)}">
      ${formatStatus(status)}
    </span>
    <p>${country.detailSummary}</p>
    <div class="detail-stats">
      <span class="stat-pill">
        <span class="stat-pill__value">${country.operatingReactors}</span>
        <span class="stat-pill__label">Operating</span>
      </span>
      <span class="stat-pill">
        <span class="stat-pill__value">${country.reactorsUnderConstruction}</span>
        <span class="stat-pill__label">Under construction</span>
      </span>
    </div>
    ${
      newsTitle
        ? `
          <div class="detail-actions">
            <a class="news-link" href="${latestNews.url}" target="_blank" rel="noreferrer">
              ${newsTitle}
            </a>
          </div>
        `
        : ""
    }
  `;
}

function renderSummary(countries) {
  const detail = document.getElementById("map-detail");
  if (!detail) {
    return;
  }

  const totals = countries.reduce(
    (accumulator, country) => {
      const status = resolvePrimaryStatus(country);
      accumulator.operating += country.operatingReactors;
      accumulator.building += country.reactorsUnderConstruction;
      accumulator.byStatus[status] = (accumulator.byStatus[status] || 0) + 1;
      return accumulator;
    },
    { operating: 0, building: 0, byStatus: {} }
  );

  const summaryItems = STATUS_PRIORITY.filter((status) => totals.byStatus[status]).map(
    (status) => `
      <div class="summary-row">
        <span class="summary-label">
          <span class="legend-swatch" style="background:${getStatusColor(status)}"></span>
          ${formatStatus(status)}
        </span>
        <strong>${totals.byStatus[status]}</strong>
      </div>
    `
  );

  detail.style.removeProperty("--detail-accent");
  detail.innerHTML = `
    <p class="eyebrow">Summary card</p>
    <h3>EU nuclear overview</h3>
    <p>Click a country to inspect its status, reactor counts, and latest news. Click empty map space to clear the selection.</p>
    <div class="summary-list">
      ${summaryItems.join("")}
    </div>
  `;
}

function activateCountry(countryCode, countries) {
  const country = countries.find((entry) => entry.countryCode === countryCode);

  document.querySelectorAll("[data-country-code]").forEach((node) => {
    const active = node.dataset.countryCode === countryCode;
    node.classList.toggle("is-active", active);
    if (active && node.parentNode) {
      node.parentNode.appendChild(node);
    }
  });

  if (!country) {
    renderSummary(countries);
    if (document.body.dataset.page === "sources") {
      history.replaceState(null, "", window.location.pathname);
    }
    return;
  }

  renderDetail(country);

  const hash = `#${countryCode.toLowerCase()}`;
  if (document.body.dataset.page === "sources") {
    history.replaceState(null, "", hash);
  }
}

function renderDashboard(countries, map) {
  createLegend();

  const mapContainer = document.getElementById("map-container");
  const legend = document.getElementById("legend");
  if (!mapContainer || !legend) {
    return;
  }

  mapContainer.replaceChildren(legend, map);

  mapContainer.addEventListener("click", (event) => {
    if (!event.target.closest("[data-country-code]")) {
      activateCountry(null, countries);
    }
  });

  document.querySelectorAll("[data-country-code]").forEach((node) => {
    node.addEventListener("click", () => activateCountry(node.dataset.countryCode, countries));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCountry(node.dataset.countryCode, countries);
      }
    });
  });

  activateCountry(null, countries);
}

function renderSources(countries) {
  const list = document.getElementById("sources-list");
  const search = document.getElementById("country-search");
  if (!list) {
    return;
  }

  const draw = (query = "") => {
    const normalized = query.trim().toLowerCase();
    const filtered = countries.filter((country) => {
      const status = resolvePrimaryStatus(country);
      return (
        country.countryName.toLowerCase().includes(normalized) ||
        status.toLowerCase().includes(normalized)
      );
    });

    list.innerHTML = "";
    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">No countries match that filter.</div>`;
      return;
    }

    filtered.forEach((country) => {
      const status = resolvePrimaryStatus(country);
      const badgeClass = LIGHT_BG_STATUSES.has(status) ? "status-badge is-light-bg" : "status-badge";
      const article = document.createElement("article");
      article.className = "source-card";
      article.id = country.countryCode.toLowerCase();
      article.innerHTML = `
        <header class="source-header">
          <div>
            <p class="eyebrow">${country.flag} ${country.countryCode}</p>
            <h2>${country.countryName}</h2>
          </div>
          <span class="${badgeClass}" style="background:${getStatusColor(status)}">
            ${formatStatus(status)}
          </span>
        </header>
        <p>${country.detailSummary}</p>
        <div class="detail-stats">
          <span class="stat-pill">
            <span class="stat-pill__value">${country.operatingReactors}</span>
            <span class="stat-pill__label">Operating</span>
          </span>
          <span class="stat-pill">
            <span class="stat-pill__value">${country.reactorsUnderConstruction}</span>
            <span class="stat-pill__label">Under construction</span>
          </span>
        </div>
        <section>
          <h3>Sources</h3>
          <ol class="source-list">
            ${country.sources
              .map(
                (source) => `
                  <li>
                    <a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>
                    <span> (${source.publisher}, accessed ${source.accessedAt})</span>
                    <div>${source.note}</div>
                  </li>
                `
              )
              .join("")}
          </ol>
        </section>
        <section>
          <h3>Recent news</h3>
          <ol class="news-list">
            ${country.latestNews
              .map(
                (item) => `
                  <li>
                    <a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>
                    <span> (${item.publishedAt})</span>
                  </li>
                `
              )
              .join("")}
          </ol>
        </section>
      `;
      list.appendChild(article);
    });
  };

  draw();
  if (search) {
    search.addEventListener("input", (event) => draw(event.target.value));
  }
}

function validateDataset(countries) {
  if (countries.length !== EU_COUNTRY_CODES.length) {
    throw new Error(`Dataset must include ${EU_COUNTRY_CODES.length} EU countries.`);
  }

  const seen = new Set();
  countries.forEach((country) => {
    const status = resolvePrimaryStatus(country);
    if (seen.has(country.countryCode)) {
      throw new Error(`Duplicate country code: ${country.countryCode}`);
    }
    seen.add(country.countryCode);
    if (!STATUS_COLORS[status]) {
      throw new Error(`Invalid primary status for ${country.countryName}`);
    }
  });
}

function validateMapData(featuresByCode, countries) {
  countries.forEach((country) => {
    const feature = featuresByCode.get(country.countryCode);
    if (!feature) {
      throw new Error(`Map geography missing for ${country.countryName}.`);
    }

    if (filterEuropeanPolygons(feature.geometry, country.countryCode).length === 0) {
      throw new Error(`No European geometry found for ${country.countryName}.`);
    }
  });
}

async function init() {
  try {
    initThemeToggle();
    const countries = await loadCountries();
    renderDatasetDate(countries);
    validateDataset(countries);

    if (document.body.dataset.page === "dashboard") {
      const geography = await loadMapGeography();
      const featuresByCode = new Map(
        geography.features
          .filter((feature) => Object.values(GEOJSON_COUNTRY_IDS).includes(feature.properties.CNTR_ID))
          .map((feature) => {
            const countryCode =
              Object.entries(GEOJSON_COUNTRY_IDS).find(([, geoId]) => geoId === feature.properties.CNTR_ID)?.[0] ||
              feature.properties.CNTR_ID;
            return [countryCode, feature];
          })
      );
      const contextFeatures = geography.features.filter((feature) =>
        Object.values(CONTEXT_COUNTRY_IDS).includes(feature.properties.CNTR_ID)
      );
      const russia = geography.features.find((feature) => feature.properties.CNTR_ID === "RU");
      const kaliningradPolygons = KALININGRAD_POLYGON_INDEXES.map(
        (index) => russia?.geometry?.coordinates?.[index]
      ).filter(Boolean);
      const contextEntries = [
        ...contextFeatures.map((feature) => ({
          id: feature.properties.CNTR_ID,
          feature
        })),
        {
          id: "KAL",
          polygons: kaliningradPolygons
        }
      ];

      validateMapData(featuresByCode, countries);
      const map = createMapSvg(featuresByCode, contextEntries, countries);
      renderDashboard(countries, map);
      return;
    }

    renderSources(countries);
  } catch (error) {
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  }
}

init();
