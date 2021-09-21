import PropTypes from "prop-types";

const tooltips = {
		"3": "Three Point Shooter",
		A: "Athlete",
		B: "Ball Handler",
		Di: "Interior Defender",
		Dp: "Perimeter Defender",
		Po: "Post Scorer",
		Ps: "Passer",
		R: "Rebounder",
		V: "Volume Scorer",
	};

const SkillsBlock = ({
	className,
	skills,
}: {
	className?: string;
	skills?: string[];
}) => {
	if (skills === undefined) {
		return null;
	}

	return (
		<span className={className}>
			{skills.map(skill => (
				<span
					key={skill}
					className="skill"
					title={
						// https://github.com/microsoft/TypeScript/issues/21732
						// @ts-ignore
						tooltips.hasOwnProperty(skill) ? tooltips[skill] : null
					}
				>
					{skill}
				</span>
			))}
		</span>
	);
};

SkillsBlock.propTypes = {
	className: PropTypes.string,
	skills: PropTypes.arrayOf(PropTypes.string),
};

export default SkillsBlock;
