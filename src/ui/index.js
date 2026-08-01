/** NaviNetics component library. Docs: /design-language-info/04-components.md */

export { Button, LinkAction } from './Button.jsx';
export { Glass, Lens } from './Glass.jsx';
export { Reticle, Rule, IsoMark } from './Reticle.jsx';
export { Section, SectionHead, Eyebrow, TickLine, Reveal } from './Section.jsx';
export { Card, ProductCard, ProductPlate, StatTile, MetricRow } from './Card.jsx';
export { Badge } from './Badge.jsx';
export { Logo } from './Logo.jsx';
export { SpecTable, ComparisonTable, ComponentList } from './SpecTable.jsx';
export { Tabs } from './Tabs.jsx';
export { Accordion } from './Accordion.jsx';
export { Field, Switch } from './Field.jsx';
export { Gallery } from './Gallery.jsx';
export { ThemeToggle } from './ThemeToggle.jsx';
export { Hero } from './Hero.jsx';
export { ConvergenceDiagram } from './ConvergenceDiagram.jsx';
export { ScrollSequence } from './ScrollSequence.jsx';
export { Statement, PullQuote } from './Statement.jsx';
export { ComingSoon } from './ComingSoon.jsx';

/**
 * Workstation and DemoLauncher are deliberately NOT re-exported here.
 *
 * Every page imports from this barrel, so anything listed lands in the main
 * bundle. Those two carry a volume renderer and a noise table that only
 * /technology/navinetics-ai needs; keeping them out lets that route split.
 * Import them from their own files.
 */
