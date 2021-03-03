import React, { useContext } from "react";
import PropTypes from "prop-types";
import styled, { ThemeContext } from "styled-components";
import Dialog from "./Dialog";
import { bytesToSize } from "@xr3ngine/engine/src/editor/functions/utils";

/**
 * [ColoredText used to provide color property Dynamically]
 * @type {Styled component}
 */
const ColoredText = (styled as any).span`
  color: ${props => props.color};
`;

/**
 * [PerformanceItemContainer used as wrapper element for Performance score]
 * @type {Styled component}
 */
const PerformanceItemContainer = (styled as any).li`
  display: flex;
  min-height: 100px;
  background-color: ${props => props.theme.toolbar};
  border: 1px solid ${props => props.theme.panel};
  border-radius: 4px;
  margin: 4px;
  color: white;
  max-width: 560px;

  & > :first-child {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100px;
  }

  & > :last-child {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px;
    border-left: 1px solid ${props => props.theme.panel2};
  }

  h5 {
    font-size: 20px;
  }

  h6 {
    font-size: 16px;
  }

  a {
    white-space: nowrap;
    color: ${props => props.theme.blue};
  }

  p {
    margin: 0;
  }
`;

/**
 * [PerformanceCheckItem used to render view for PerformanceCheckDialog]
 * @param       {String} score
 * @param       {String} scoreColor
 * @param       {String} title
 * @param       {String} description
 * @param       {String} learnMoreUrl
 * @param       {node} children
 * @constructor
 */
function PerformanceCheckItem({ score, scoreColor, title, description, learnMoreUrl, children }) {
  return (
    <PerformanceItemContainer>
      <div>
        <ColoredText as="h5" color={scoreColor}>
          {score}
        </ColoredText>
      </div>
      <div>
        <h6>
          {title}: {children}
        </h6>
        <p>
          {description}{" "}
          <a rel="noopener noreferrer" target="_blank" href={learnMoreUrl}>
            Learn More
          </a>
        </p>
      </div>
    </PerformanceItemContainer>
  );
}

/**
 * [declairing propTypes for PerformanceCheckItem]
 * @type {Object}
 */
PerformanceCheckItem.propTypes = {
  score: PropTypes.string.isRequired,
  scoreColor: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  description: PropTypes.string.isRequired,
  learnMoreUrl: PropTypes.string.isRequired
};

/**
 * [initializing scoreToValue with object containing Low Medium High]
 * @type {Object}
 */
const scoreToValue = {
  Low: 0,
  Medium: 1,
  High: 2
};

/**
 * [PerformanceCheckDialog used render view containing Performance scores]
 * @param       {String} scores
 * @param       {any} rest
 * @constructor
 */
export default function PerformanceCheckDialog({ scores, ...rest }) {
  const theme: any = useContext(ThemeContext);

  //initializing scoreToColor using theme
  const scoreToColor = {
    Low: theme.green,
    Medium: theme.yellow,
    High: theme.red
  };

  // initializing texturesScore using scores.textures.largeTexturesScore if scoreToValue contains scores.textures.largeTexturesScore
  // else setting scores.textures.score
  const texturesScore =
    scoreToValue[scores.textures.largeTexturesScore] > scoreToValue[scores.textures.score]
      ? scores.textures.largeTexturesScore
      : scores.textures.score;
   // returing view containing Performance
  return (
    <Dialog {...rest}>
      <ul>
        <PerformanceCheckItem
          title="Polygon Count"
          description="We recommend your scene use no more than 50,000 triangles for mobile devices."
          learnMoreUrl="htts://xr3ngine.dev/docs/editor-optimization.html"
          score={scores.polygons.score}
          scoreColor={scoreToColor[scores.polygons.score]}
        >
          <ColoredText color={scoreToColor[scores.polygons.score]}>
            {scores.polygons.value.toLocaleString()} Triangles
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title="Materials"
          description="We recommend using no more than 25 unique materials in your scene to reduce draw calls on mobile devices."
          learnMoreUrl="htts://xr3ngine.dev/docs/editor-optimization.html"
          score={scores.materials.score}
          scoreColor={scoreToColor[scores.materials.score]}
        >
          <ColoredText color={scoreToColor[scores.materials.score]}>
            {scores.materials.value} Unique Materials
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title="Textures"
          description="We recommend your textures use no more than 256MB of video RAM for mobile devices. We also recommend against using textures larger than 2048 x 2048."
          learnMoreUrl="htts://xr3ngine.dev/docs/editor-optimization.html"
          score={texturesScore}
          scoreColor={scoreToColor[texturesScore]}
        >
          <ColoredText color={scoreToColor[scores.textures.score]}>
            ~{bytesToSize(scores.textures.value)} Video RAM
          </ColoredText>
          ,{" "}
          <ColoredText color={scoreToColor[scores.textures.largeTexturesScore]}>
            {scores.textures.largeTexturesValue} Large Textures
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title="Lights"
          description="While dynamic lights are not enabled on mobile devices, we recommend using no more than 3 lights in your scene (excluding ambient and hemisphere lights) for your scene to run on low end PCs."
          learnMoreUrl="htts://xr3ngine.dev/docs/editor-optimization.html"
          score={scores.lights.score}
          scoreColor={scoreToColor[scores.lights.score]}
        >
          <ColoredText color={scoreToColor[scores.lights.score]}>{scores.lights.value} Lights</ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title="File Size"
          description="We recommend a final file size of no more than 16MB for low bandwidth connections. Reducing the file size will reduce the time it takes to download your scene."
          learnMoreUrl="htts://xr3ngine.dev/docs/editor-optimization.html"
          score={scores.fileSize.score}
          scoreColor={scoreToColor[scores.fileSize.score]}
        >
          <ColoredText color={scoreToColor[scores.fileSize.score]}>{bytesToSize(scores.fileSize.value)}</ColoredText>
        </PerformanceCheckItem>
      </ul>
    </Dialog>
  );
}

// declairing propTypes for PerformanceCheckDialog.
PerformanceCheckDialog.propTypes = {
  scores: PropTypes.object.isRequired,
  tag: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string.isRequired
};

// initializing defaultProps for PerformanceCheckDialog
PerformanceCheckDialog.defaultProps = {
  tag: "div",
  title: "Performance Check",
  confirmLabel: "Publish Scene"
};
