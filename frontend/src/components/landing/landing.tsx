import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'
import type React from 'react'

const LandingNavbar: React.FC = () => {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Motion</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="/workspace/1">
              <Button variant="ghost">Sign In</Button>
            </a>
            <Button>
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

const Hero: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            The all-in-one{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              workspace
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unite your team's work in one intelligent workspace. From project
            planning to real-time collaboration, Motion adapts to how your team
            works best.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/workspace/1">
              <Button size="lg" className="text-lg px-8 py-6">
                Start for free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            Free 14-day trial • No credit card required • Setup in 2 minutes
          </p>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <main>
      <LandingNavbar />
      <Hero />
    </main>
  )
}
