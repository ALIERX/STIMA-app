import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null } }
  static getDerivedStateFromError(err){ return { hasError:true, error:err } }
  componentDidCatch(err, info){ console.error('UI crash:', err, info) }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:24}}>
          <h2>Something went wrong.</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
          <p>Open the browser console for details.</p>
        </div>
      )
    }
    return this.props.children
  }
}
