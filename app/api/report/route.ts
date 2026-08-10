import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request: NextRequest) {
  const portfolio = request.nextUrl.searchParams.get("portfolio") ?? "aarav";
  const origin = request.nextUrl.origin;
  const reportUrl = `${origin}/report?portfolio=${encodeURIComponent(portfolio)}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    // A4 width in px at 96 dpi — keeps the layout exactly as designed
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // Emulate print media so CSS print rules fire before the page loads
    await page.emulateMediaType("print");

    await page.goto(reportUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for web fonts (Inter) to finish loading
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "18mm", right: "14mm", bottom: "22mm", left: "14mm" },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width:100%;font-size:8px;font-family:'Inter',system-ui,sans-serif;color:#b8b3c0;padding:0 20px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;color:#8f78ff;">Vantage · Portfolio Intelligence</span>
          <span>Confidential</span>
        </div>`,
      footerTemplate: `
        <div style="width:100%;font-size:8px;font-family:'Inter',system-ui,sans-serif;color:#b8b3c0;padding:0 20px;display:flex;justify-content:space-between;align-items:center;">
          <span>${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
    });

    const investorName = portfolio.charAt(0).toUpperCase() + portfolio.slice(1);

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vantage_Report_${investorName}_${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
