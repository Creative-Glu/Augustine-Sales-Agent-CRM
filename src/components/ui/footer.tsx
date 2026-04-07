'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Github, Package, Heart, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: FC = () => {
  return (
    <footer className="w-full border-t bg-gradient-to-b from-background/80 to-background backdrop-blur-sm">
      <div className=" px-6 py-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Creative-Glu
              </span>
            </div>
            <span className="text-sm text-muted-foreground border-l pl-4">Version 0.1.1</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6 text-sm text-muted-foreground opacity-50">
            {['/about', '/help', '/privacy', '/terms'].map((href, i) => (
              <span
                key={i}
                className="cursor-not-allowed pointer-events-none hover:cursor-not-allowed"
              >
                {href.replace('/', '').replace(/^\w/, (c) => c.toUpperCase())}
              </span>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center space-x-3 ">
            <Button className="cursor-not-allowed" variant="ghost" size="icon" asChild>
              <Link
                href="https://github.com/Creative-Glu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button className="cursor-not-allowed" variant="ghost" size="icon" asChild>
              <Link
                href="https://twitter.com/CreativeGlu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by Creative-Glu Team</span>
          </div>
          <div>© {new Date().getFullYear()} Creative-Glu. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
