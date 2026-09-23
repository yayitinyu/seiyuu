export type FilingLink = {
  label: string;
  href: string;
};

export function filingLinks(icpNumber?: string, mpsNumber?: string): FilingLink[] {
  const links: FilingLink[] = [];
  const icp = icpNumber?.trim();
  const mps = mpsNumber?.trim();

  if (icp) {
    links.push({ label: icp, href: "https://beian.miit.gov.cn/" });
  }

  if (mps) {
    const code = mps.match(/(?:^|\D)(\d{14})(?!\d)/)?.[1];
    links.push({
      label: mps,
      href: code
        ? `https://beian.mps.gov.cn/#/query/webSearch?code=${code}`
        : "https://beian.mps.gov.cn/#/query/webSearch",
    });
  }

  return links;
}
