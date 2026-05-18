import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: 'var(--color-bg)',
          fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)',
          flexDirection: 'column', gap: 'var(--space-lg)'
        }}>
          <h2>页面出现错误</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>请刷新重试</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 24px', border: '1px solid var(--color-accent)',
              borderRadius: 6, background: 'transparent',
              color: 'var(--color-accent-dark)', cursor: 'pointer'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
