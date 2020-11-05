import React, { Component } from "react";
import styled from "styled-components";

const Section = (styled as any).section`
  padding: 100px 0;
`;

const HeroContainer = (styled as any).div`
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  grid-gap: 80px;
  max-width: 1200px;
  padding: 0 20px;
  justify-content: center;
  align-items: center;
  margin: 0 auto;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    grid-gap: 20px;
  }
`;

const HeroLeft = (styled as any).div`
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    font-weight: lighter;
    font-size: 2em;
    margin-bottom: 1.5em;
  }

  a {
    color: ${props => props.theme.text};
  }

  @media (max-width: 1200px) {
    font-size: 10px;
  }

  @media (max-width: 800px) {
    font-size: 8px;
  }
`;

const LogoContainer = (styled as any).div`
  position: relative;
  margin-bottom: 5em;
  max-width: 385px;

  h2 {
    position: absolute;
    right: 6px;
    bottom: -8px;
    font-weight: bold;
    font-size: 3em;
  }
`;

const HeroRight = (styled as any).div`
  video {
    border-radius: 8px;
    background-color: ${props => props.theme.panel};
  }
`;

const CalloutContainer = (styled as any).div`
  display: grid;
  grid-gap: 80px;
  max-width: 1200px;
  padding: 0 20px;
  margin: 0 auto;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export default class LandingPage extends Component {
  render() {
    return (
        <main>
          <Section>
                <a href="/editor/projects">
                  Get Started
                </a>
          </Section>
        </main>
    );
  }
}
