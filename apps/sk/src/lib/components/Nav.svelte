<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
  import { Menu } from "@lucide/svelte";
  import { page } from "$app/state";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

  // Define the navigation items
  const navItems = [{ label: "", href: "/" }];

  // Determine if a nav item is active
  let isActive = $derived((href: string) => page.url.pathname === href);

  // Toggle for mobile menu (optional usage)
  let isMobileMenuOpen = $state(false);
</script>

<header class="fixed top-0 z-50 w-full">
  <div class="container flex h-14 items-center mt-6">
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
      <AlertDialog.Root>
        <AlertDialog.Trigger class={buttonVariants({ variant: "link" })}>
          Instructions
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action>Continue</AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <AlertDialog.Root>
        <AlertDialog.Trigger class={buttonVariants({ variant: "link" })}>
          About
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action>Continue</AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
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
                onclick={() => (isMobileMenuOpen = false)}
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
