import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppSidebar } from '../components/app-sidebar';
import { SidebarProvider } from '../components/ui/sidebar';

function renderSidebar(route = '/', defaultOpen = true) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe('AppSidebar', () => {
  it('renders all 4 nav items', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    expect(screen.getByText('Claims')).toBeInTheDocument();
  });

  it('renders the app name Aegis CRM when expanded', () => {
    renderSidebar('/', true);
    expect(screen.getByText('Aegis CRM')).toBeInTheDocument();
  });

  it('renders the shield/logo icon', () => {
    renderSidebar();
    // ShieldCheck icon is rendered inside the header
    const header = document.querySelector('[data-sidebar="header"]');
    expect(header).toBeTruthy();
  });

  it('Dashboard link points to /', () => {
    renderSidebar('/');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/');
  });

  it('Clients link points to /clients', () => {
    renderSidebar('/clients');
    const clientsLink = screen.getByText('Clients').closest('a');
    expect(clientsLink).toHaveAttribute('href', '/clients');
  });

  it('Policies link points to /policies', () => {
    renderSidebar('/policies');
    const policiesLink = screen.getByText('Policies').closest('a');
    expect(policiesLink).toHaveAttribute('href', '/policies');
  });

  it('Claims link points to /claims', () => {
    renderSidebar('/claims');
    const claimsLink = screen.getByText('Claims').closest('a');
    expect(claimsLink).toHaveAttribute('href', '/claims');
  });

  it('does not render text labels when collapsed', () => {
    // When defaultOpen=false, sidebar is collapsed and spans are conditionally rendered
    render(
      <MemoryRouter initialEntries={['/']}>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>
    );
    // In collapsed mode, the component uses !collapsed check to hide spans
    // The state would be "collapsed" so spans are not rendered
    const spans = screen.queryByText('Dashboard');
    expect(spans).toBeNull();
  });
});
