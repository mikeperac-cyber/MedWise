/**
 * Akademik Portföy page: the measured results, plus the clinical vignettes.
 *
 * Everything on this page is computed from the live corpus at render time. None
 * of these numbers are typed into the markup, so they cannot drift away from
 * what the data actually says — which is the whole point, given that the
 * previous build's hero claimed "593+ doğrulanmış monograf" when 56 records
 * were verifiable.
 */

import { state } from "../state.ts";
import { clinicalCaseStudies } from "../constants/caseStudies.ts";
import { summarizeCorpus, type CorpusReadability } from "../utils/readability.ts";
import { summarizeProvenance, summarizeCitations, isVerifiedAtc } from "../utils/provenance.ts";
import { buildPlainSummary } from "../utils/plainLanguage.ts";
import { byId, escapeHtml } from "../shell/shell.ts";

const BAND_COLORS: Record<string, string> = {
  "çok kolay": "bg-emerald-500",
  kolay: "bg-lime-500",
  orta: "bg-amber-400",
  zor: "bg-orange-500",
  "çok zor": "bg-red-600",
};

function statCard(label: string, value: string, note: string, tone = "text-on-surface"): string {
  return `
    <div class="p-4 rounded-2xl bg-white border border-outline-variant/60 space-y-1">
      <div class="text-[11px] font-bold text-outline uppercase tracking-wider">${escapeHtml(label)}</div>
      <div class="font-mono text-2xl font-bold ${tone}">${escapeHtml(value)}</div>
      <p class="text-[11px] text-on-surface-variant leading-relaxed">${escapeHtml(note)}</p>
    </div>
  `;
}

/** Horizontal band distribution, so the shape of the corpus is visible at a glance. */
function bandBar(summary: CorpusReadability): string {
  if (summary.count === 0) return "";

  const segments = Object.entries(summary.bands)
    .filter(([, count]) => count > 0)
    .map(([band, count]) => {
      const pct = ((count / summary.count) * 100).toFixed(2);
      return `<div class="${BAND_COLORS[band]} h-full" style="width:${pct}%" title="${escapeHtml(band)}: ${count}"></div>`;
    })
    .join("");

  const legend = Object.entries(summary.bands)
    .map(
      ([band, count]) => `
      <span class="inline-flex items-center gap-1.5 text-[11px] text-on-surface-variant">
        <span class="w-2.5 h-2.5 rounded-sm ${BAND_COLORS[band]}" aria-hidden="true"></span>
        ${escapeHtml(band)}: <strong class="font-mono">${count}</strong>
      </span>`
    )
    .join("");

  return `
    <div class="space-y-2">
      <div class="flex h-3 w-full rounded-full overflow-hidden bg-surface-container" role="img"
           aria-label="Okunabilirlik bandı dağılımı">${segments}</div>
      <div class="flex flex-wrap gap-x-4 gap-y-1">${legend}</div>
    </div>
  `;
}

function section(title: string, subtitle: string, body: string): string {
  return `
    <section class="bg-white rounded-3xl border border-outline-variant/70 p-6 sm:p-8 shadow-luminous space-y-5">
      <div>
        <h2 class="font-serif text-2xl font-bold text-on-surface">${escapeHtml(title)}</h2>
        <p class="text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">${subtitle}</p>
      </div>
      ${body}
    </section>
  `;
}

export function renderPortfolioMetrics(): void {
  const host = byId("portfolio-metrics");
  if (!host) return;

  const drugs = state.drugs;
  if (drugs.length === 0) {
    host.innerHTML = `<p class="text-sm text-on-surface-variant">Veri kümesi yükleniyor...</p>`;
    return;
  }

  // --- Provenance -----------------------------------------------------------
  const prov = summarizeProvenance(drugs);
  const cit = summarizeCitations(drugs);

  const heroCount = byId("hero-record-count");
  if (heroCount) {
    heroCount.textContent = `${prov.total} kayıt · ${cit.cited} kaynaklı doğrulama`;
  }

  const provenanceBody = `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      ${statCard("Toplam kayıt", String(prov.total), "Veri kümesindeki ilaç sayısı.")}
      ${statCard("Kaynaklı doğrulama", String(cit.cited), "WHO ATC/DDD Index ve/veya FDA DailyMed belgesiyle elle kontrol edildi.", "text-emerald-700")}
      ${statCard("Doğrulanamayan", String(prov.unverified), "Tanımlayıcıları üretici betik tarafından uydurulmuş.", "text-error")}
      ${statCard("Oran", `%${prov.unverifiedPercent}`, "Kayıtların bu kadarı doğrulanamıyor.", "text-error")}
    </div>
    <div class="p-4 rounded-2xl border-2 border-error/40 bg-error-container/30 text-xs text-on-error-container leading-relaxed space-y-2">
      <p class="font-bold">Bu projenin en önemli bulgusu, projenin kendi verisi hakkındadır.</p>
      <p>
        <code class="font-mono">scripts/generate_drugs.mjs</code> betiği, veri kümesini 10 kayıttan
        593 kayda çıkarırken ATC, NDC ve TİTCK numaralarını bir döngü sayacından üretti.
        İlaç <em>adları</em> gerçektir; bu üç tanımlayıcı ise ${prov.unverified} kayıtta gerçek değildir.
        Uygulama artık bu kayıtları gizlemiyor, ama her monografın başında açık bir uyarı
        gösteriyor ve o kayıtlar için sade dil özeti üretmeyi reddediyor.
      </p>
      <p>
        Geri kalan ${cit.verified} kayıt ise sadece ATC biçimi geçerli değil — her biri gerçek bir
        WHO ATC/DDD Index kaydına, ${cit.cited === cit.verified ? "hepsi" : `${cit.cited}'i`} ise
        ayrıca bir FDA DailyMed belgesine karşı elle kontrol edildi ve kaynak bağlantısı her
        monografta gösteriliyor.
      </p>
    </div>
  `;

  // --- Readability ----------------------------------------------------------
  const verified = drugs.filter((d) => isVerifiedAtc(d.atc));
  const plainTexts = verified
    .map((d) => buildPlainSummary(d))
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => `${p.purpose} ${p.howToTake}`);

  const allTechnical = summarizeCorpus(drugs.map((d) => d.description));
  const verifiedTechnical = summarizeCorpus(verified.map((d) => d.description));
  const plain = summarizeCorpus(plainTexts);

  const readabilityBody = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      ${statCard(
        "Teknik metin (tümü)",
        String(allTechnical.medianAtesman),
        `Ateşman ortancası, ${allTechnical.count} açıklama. 0 = çok zor, 100 = çok kolay.`,
        "text-error"
      )}
      ${statCard(
        "Teknik metin (doğrulanmış)",
        String(verifiedTechnical.medianAtesman),
        `Ateşman ortancası, ${verifiedTechnical.count} açıklama.`,
        "text-orange-600"
      )}
      ${statCard(
        "Sade dil katmanı",
        String(plain.medianAtesman),
        `Ateşman ortancası, ${plain.count} özet.`,
        "text-emerald-700"
      )}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-outline uppercase tracking-wider">Önce: teknik açıklamalar</h3>
        ${bandBar(allTechnical)}
      </div>
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-outline uppercase tracking-wider">Sonra: sade dil özetleri</h3>
        ${bandBar(plain)}
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-xs text-on-surface-variant leading-relaxed space-y-2">
      <p>
        <strong class="text-on-surface">Yöntem.</strong> İki yayımlanmış Türkçe okunabilirlik
        formülü kullanıldı: Ateşman (1997, 0-100 ölçeği) ve Bezirci-Yılmaz (2010, gereken
        eğitim yılı). Türkçede her hece tam olarak bir sesli harf içerdiği için hece sayımı
        tahmin değil, kesin bir işlemdir. Uygulama:
        <code class="font-mono">src/utils/readability.ts</code>.
      </p>
      <p>
        <strong class="text-on-surface">Sınır.</strong> Bezirci-Yılmaz formülü kısa ve yoğun
        tek cümlelerde gerçekçi olmayacak kadar yüksek değerler üretir
        (teknik metinlerde ortanca ${verifiedTechnical.medianGrade} yıl). Bu yüzden birincil
        ölçüt olarak Ateşman raporlanmıştır.
      </p>
      <p>
        <strong class="text-on-surface">Henüz yapılmadı.</strong> Bu ölçüm metnin
        okunabilirliğini gösterir, hastanın onu <em>anladığını</em> göstermez. Bunu
        iddia edebilmek için gerçek kullanıcılarla anlama testi gerekir; bu proje
        o aşamaya henüz gelmedi.
      </p>
    </div>
  `;

  host.innerHTML =
    section(
      "Ölçülen sonuç: okunabilirlik",
      "İlacını anlamakta zorlanan biri için yazılmış olmak bir niyet değil, ölçülebilir bir özelliktir. Aşağıdaki sayılar her sayfa yüklenişinde canlı veri kümesinden hesaplanır.",
      readabilityBody
    ) +
    section(
      "Veri kaynağı denetimi",
      "Bir sağlık uygulamasında verinin nereden geldiği, verinin kendisi kadar önemlidir.",
      provenanceBody
    );
}

export function renderCaseStudies(): void {
  const container = byId("case-studies-container");
  if (!container) return;

  container.innerHTML = clinicalCaseStudies
    .map(
      (cs) => `
      <article class="p-6 rounded-3xl bg-surface-container-low/60 border border-outline-variant/70 space-y-4 transition-all hover:border-primary/40">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container pb-3">
          <span class="px-3 py-1 rounded-full bg-primary-fixed text-primary font-mono text-xs font-bold border border-primary-fixed-dim">
            ${escapeHtml(cs.badge)}
          </span>
          <span class="text-xs font-mono text-outline">Hasta profili: ${escapeHtml(cs.patientProfile.age)} yaş, ${escapeHtml(cs.patientProfile.gender)}</span>
        </div>

        <div>
          <h3 class="font-serif text-lg sm:text-xl font-bold text-on-surface">${escapeHtml(cs.title)}</h3>
          <div class="flex flex-wrap gap-1.5 mt-2">
            ${cs.patientProfile.diagnoses
              .map(
                (d) =>
                  `<span class="px-2 py-0.5 rounded-md bg-white border border-outline-variant/50 text-[11px] text-on-surface">${escapeHtml(d)}</span>`
              )
              .join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-white border border-outline-variant/50 space-y-2">
            <span class="text-[11px] font-bold text-outline uppercase tracking-wider block">Başvuru anındaki rejim</span>
            <ul class="space-y-1 text-on-surface-variant">
              ${cs.currentRegimen
                .map(
                  (r) =>
                    `<li>• <strong>${escapeHtml(r.name)}</strong> (${escapeHtml(r.dose)}) — <em>${escapeHtml(r.timing)}</em></li>`
                )
                .join("")}
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-outline-variant/50 space-y-2">
            <span class="text-[11px] font-bold text-error uppercase tracking-wider block">Klinik ikilem</span>
            <p class="text-on-surface-variant leading-relaxed">${escapeHtml(cs.clinicalDilemma)}</p>
            <div class="p-2 rounded-xl bg-error-container/30 border border-error/20 text-[11px] text-on-error-container">
              <strong>Mekanizma:</strong> ${escapeHtml(cs.algorithmicFindings.mechanism)}
            </div>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-primary-fixed-dim space-y-2">
          <div class="flex items-center gap-1.5 text-primary text-xs font-bold">
            <span class="material-symbols-outlined text-[17px]" aria-hidden="true">lightbulb</span>
            <span>Bu vakadan çıkan ders</span>
          </div>
          <p class="text-xs text-on-surface-variant">${escapeHtml(cs.medwiseResolution.chronotherapyTiming)}</p>
          <p class="text-[11px] text-primary italic pt-2 border-t border-surface-container">
            ${escapeHtml(cs.admissionsLearningOutcome)}
          </p>
        </div>
      </article>
    `
    )
    .join("");
}

export function initPortfolio(drugsLoaded: Promise<void>): void {
  renderCaseStudies();
  void drugsLoaded.then(renderPortfolioMetrics);
}
