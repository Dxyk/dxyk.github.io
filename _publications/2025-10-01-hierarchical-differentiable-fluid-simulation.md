---
title: "Hierarchical Differentiable Fluid Simulation"
collection: publications
category: journal
permalink: /publication/2025-10-01-hierarchical-differentiable-fluid-simulation/
excerpt: 'Differentiable simulation is an emerging field that offers a powerful and flexible route to fluid control. In grid-based settings, high memory consumption is a long-standing bottleneck that constrains optimization resolution. We introduce a two-step algorithm that significantly reduces memory usage: our method first optimizes for bulk forces at reduced resolution, then refines local details over sub-domains while maintaining differentiability. In trading runtime for memory, it enables optimization at previously unattainable resolutions. We validate its effectiveness and memory savings on a series of fluid control problems.'
date: 2025-10-01
venue: 'Computer Graphics Forum'
slidesurl: # 'http://academicpages.github.io/files/slides1.pdf'
paperurl: '/files/Hierarchical-Diff-Fluid/Hierarchical-Diff-Fluid.pdf'
bibtexurl: # 'http://academicpages.github.io/files/bibtex1.bib'
citation: # 'Your Name, You. (2009). &quot;Paper Title Number 1.&quot; <i>Journal 1</i>. 1(1).'
header:
  teaser: "/files/Hierarchical-Diff-Fluid/Teaser.png"
image:
  path: "/files/Hierarchical-Diff-Fluid/Teaser.png"
  alt: "Fluid Controls Learned through Hierarchical Differentiable Fluid Simulation"
authors:
  - name: "Xiangyu Kong"
    affiliations:
      - "McGill University"
      - "Mila"
      - "Ubisoft"
    link: "https://dxyk.github.io"
    is_primary: true
  - name: "Arnaud Schoentgen"
    affiliations:
      - "Ubisoft"
    link: "https://arnaudschoentgen.github.io"
  - name: "Damien Rioux-Lavoie"
    affiliations:
      - "Ubisoft"
    link: "https://riouxld21.github.io/"
  - name: "Paul G. Kry"
    affiliations:
      - "McGill University"
    link: "https://www.cs.mcgill.ca/~kry/"
  - name: "Derek Nowrouzezahrai"
    affiliations:
      - "McGill University"
      - "Mila"
      - "Canada CIFAR AI Chair"
    link: "https://cim.mcgill.ca/~derek/"
---

[📄 Download PDF]({{ page.paperurl }}){: .btn .btn-primary }
[📑 Download BibTeX]({{ page.bibtexurl }}){: .btn }

{% if page.header.teaser %}
![Teaser]({{ page.header.teaser }}){: .img-fluid .rounded .mb-4 }
{% endif %}

## Abstract

Differentiable simulation is an emerging field that offers a powerful and flexible route to fluid control. In grid-based settings, high memory consumption is a long-standing bottleneck that constrains optimization resolution. We introduce a two-step algorithm that significantly reduces memory usage: our method first optimizes for bulk forces at reduced resolution, then refines local details over sub-domains while maintaining differentiability. In trading runtime for memory, it enables optimization at previously unattainable resolutions. We validate its effectiveness and memory savings on a series of fluid control problems.
