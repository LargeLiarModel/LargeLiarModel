<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
  import { Menu } from "@lucide/svelte";
  import { page } from "$app/stores";

  // Define the navigation items
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Play", href: "/play" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "About", href: "/about" },
  ];

  // Determine if a nav item is active
  $: isActive = (href: string) => $page.url.pathname === href;

  // Toggle for mobile menu (optional usage)
  let isMobileMenuOpen = false;
</script>

<header
  class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="container flex h-14 items-center">
    <!-- Logo -->
    <div class="mr-4 flex">
      <a href="/" class="flex items-center space-x-2">
        <span class="font-bold text-xl">Large Liar Model</span>
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav
      class="hidden md:flex items-center space-x-6 text-sm font-medium flex-1"
    >
      {#each navItems as { label, href }}
        <a
          {href}
          class={`transition-colors hover:text-foreground/80 ${
            isActive(href) ? "text-foreground" : "text-foreground/60"
          }`}
          aria-current={isActive(href) ? "page" : undefined}
        >
          {label}
        </a>
      {/each}
    </nav>

    <!-- Right Side Actions -->
    <div class="hidden md:flex items-center space-x-2">
      <Button variant="outline" size="sm" href="/signin">Sign In</Button>
      <Button size="sm" href="/signup">Sign Up</Button>
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex md:hidden flex-1 justify-end">
      <Sheet bind:open={isMobileMenuOpen}>
        <SheetTrigger>
          {#snippet child(props)}
            <Button {...props} variant="ghost" size="icon" class="shrink-0">
              <Menu class="h-5 w-5" />
              <span class="sr-only">Open menu</span>
            </Button>
          {/snippet}
        </SheetTrigger>
        <SheetContent side="right" class="w-full max-w-xs sm:max-w-sm">
          <nav class="flex flex-col gap-4 mt-8">
            {#each navItems as { label, href }}
              <a
                {href}
                class={`text-lg font-medium transition-colors hover:text-foreground/80 ${
                  isActive(href) ? "text-foreground" : "text-foreground/60"
                }`}
                aria-current={isActive(href) ? "page" : undefined}
                on:click={() => (isMobileMenuOpen = false)}
              >
                {label}
              </a>
            {/each}
            <div class="flex flex-col space-y-2 mt-4">
              <Button variant="outline" href="/signin">Sign In</Button>
              <Button href="/signup">Sign Up</Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</header>
