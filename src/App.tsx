import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './navigation/AppRoutes';
import { Layout } from './components/Layout';
export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Layout>
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, ...rest } = route;
            return <Route key={index} {...rest} element={element} />;
          })}
        </Routes>
      </Layout>
    );
  }
}
