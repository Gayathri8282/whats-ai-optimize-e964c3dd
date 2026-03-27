import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  BarChart3,
  Brain,
  Target,
  Shield,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            AI-powered WhatsApp marketing that converts
          </h1>

          <ul className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Smart A/B testing</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> AI-generated campaigns</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Real-time analytics</li>
          </ul>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-base px-8">
              Start Free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.querySelector("#product")?.scrollIntoView({ behavior: "smooth" })}>
              See how it works
            </Button>
          </div>
        </div>

        {/* Product screenshot placeholder */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="rounded-xl border border-border bg-muted/40 aspect-video flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Product Preview</span>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-16 md:py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
            Trusted by growing teams
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-muted-foreground/60">
            {["Acme Corp", "Globex", "Initech", "Umbrella", "Cyberdyne"].map((name) => (
              <span key={name} className="text-lg font-semibold">{name}</span>
            ))}
          </div>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Rated 4.9/5 from 200+ marketing teams
          </p>
        </div>
      </section>

      {/* ── Problem → Solution ── */}
      <section id="about" className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm text-primary font-semibold uppercase tracking-widest">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Most WhatsApp campaigns are guesswork
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Marketers send the same message to every customer and hope for the best. No testing, no personalization, no data. Budgets are wasted and customers tune out.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center space-y-6">
          <p className="text-sm text-primary font-semibold uppercase tracking-widest">The Solution</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Let AI optimize every message
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Our platform uses LLM-generated variants and Thompson Sampling to automatically find the highest-converting message — then scales it across your audience in real time.
          </p>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section id="product" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm text-primary font-semibold uppercase tracking-widest">Features</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything you need to win on WhatsApp
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Campaign Generation", desc: "Generate high-converting message variants with Groq LLaMA in seconds." },
              { icon: Target, title: "Smart A/B Testing", desc: "Thompson Sampling automatically allocates traffic to the winning variant." },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Live dashboards showing CTR, conversions, and revenue per variant." },
              { icon: MessageSquare, title: "AI Chat Assistant", desc: "Conversational AI helps you refine campaigns and interpret results." },
              { icon: Shield, title: "Compliance Built-In", desc: "GDPR-ready opt-out management and audit-ready campaign logs." },
              { icon: Zap, title: "Instant Deployment", desc: "Launch campaigns to thousands of customers in a single click." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-8 space-y-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual Demo ── */}
      <section id="use-cases" className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-sm text-primary font-semibold uppercase tracking-widest">How It Works</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              From idea to optimized campaign in 3 steps
            </h2>
            <ol className="space-y-5">
              {[
                { step: "1", text: "Describe your product and audience — the AI generates multiple message variants." },
                { step: "2", text: "Launch an A/B test. Thompson Sampling shifts traffic to the best performer live." },
                { step: "3", text: "Review real-time analytics, scale the winner, and watch conversions climb." },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {item.step}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed pt-1">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border bg-card aspect-square flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Demo Visual</span>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm text-primary font-semibold uppercase tracking-widest">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              What our users say
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { quote: "CTR jumped 40% after switching to AI-generated variants. The Thompson Sampling is a game changer.", name: "Sarah K.", role: "Growth Lead" },
              { quote: "We replaced three tools with this single platform. The real-time analytics alone saved us hours every week.", name: "James R.", role: "Marketing Manager" },
              { quote: "Setting up A/B tests used to take a day. Now I launch one in under five minutes with better results.", name: "Priya M.", role: "Digital Strategist" },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-8 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm text-primary font-semibold uppercase tracking-widest">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you're ready to scale.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
            <div className="rounded-xl border border-border bg-card p-8 text-left space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Free</p>
              <p className="text-3xl font-semibold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 500 messages/mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Basic A/B testing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Analytics dashboard</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">Get Started</Button>
            </div>
            <div className="rounded-xl border-2 border-primary bg-card p-8 text-left space-y-4">
              <p className="text-sm font-semibold text-primary">Pro</p>
              <p className="text-3xl font-semibold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited messages</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> AI campaign generation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Thompson Sampling</li>
              </ul>
              <Button className="w-full mt-4">Upgrade to Pro</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Ready to optimize your WhatsApp marketing?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join hundreds of teams using AI to send smarter messages and drive more conversions.
          </p>
          <Button size="lg" className="text-base px-8" onClick={() => navigate("/dashboard")}>
            Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">WhatsApp AI</span>
          <p>© 2026 WhatsApp AI Marketing Suite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
