/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/**
 * @todo Remove this file before PR. Just a reference.
 *
 * @fileoverview
 * Overview of the {@link typedoc https://typedoc.org/guides/doccomments/} features used by EE.
 *
 * Cat ipsum dolor sit amet, walk on car leaving trail of paw prints on hood and windshield fat baby cat best buddy little guy yet freak human out make funny noise mow mow mow mow mow mow success now attack human. Adventure always.
 * Demand to have some of whatever the human is cooking, then sniff the offering and walk away chew master's slippers.
 * Run as fast as i can into another room for no reason and sometimes switches in french and say "miaou" just because well why not skid on floor, crash into wall but sniff catnip and act crazy.
 * Steal raw zucchini off kitchen counter jump off balcony, onto stranger's head for blow up sofa in 3 seconds.
 * Why use post when this sofa is here lasers are tiny mice so lies down toilet paper attack claws fluff everywhere meow miao french ciao litterbox.
 */

import { Vector3 } from 'three'

/**
 * @description
 * Description of an awesome type.
 *
 * Cereal boxes make for five star accommodation put toy mouse in food bowl run out of litter box at full speed yet with tail in the air.
 * Hack up furballs bird bird bird bird bird bird human why take bird out i could have eaten that.
 * Instead of drinking water from the cat bowl, make sure to steal water from the toilet if it fits i sits for find something else more interesting, and if it fits, i sits or find a way to fit in tiny box for throwup on your pillow, yet dead stare with ears cocked.
 * Kitty scratches couch bad kitty.
 */
export type AwesomeType = { a: '123'; b: 'abc'; c: '42' }

/**
 * @description
 * Description of a function.
 * @param one Description of the first argument. synonym: @arg
 * @param two Description of the second argument. Default values of arguments are implied.
 * @param three Description of the third argument. Object default values will render as TheType(...)
 * @returns Description of the returned data. Doesn't need a type, only its description.
 */
export default function defaultFunction(one: AwesomeType, two = true, three = new Vector3(0, -1, 0)): AwesomeType {
  return {} as AwesomeType
}
