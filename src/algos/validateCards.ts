import { Card, comparatorRanked, Rank } from '@bhoos/cards';

export function isCardsSameRank(cards: Card[]) {
  const copyCards = cards.slice();
  let isCardSameRank = false
  while (copyCards.length > 0) {
    const firstCard = copyCards.shift();
    if (!firstCard) break;
    if (firstCard?.rank.isEqual(copyCards[0].rank)) {
      isCardSameRank = true;
    } else {
      if (copyCards.length !== 0) {
        isCardSameRank = false;
      }
      break;
    }
  }
  return isCardSameRank;
}

function removeWildCards(cards: Card[], wildCards: Card[]) {
  if (!wildCards) {
    // if there are no wild cards, just clone the original
    return cards.slice(0);
  }

  // Remove all the wild cards
  return cards.filter(card => wildCards.findIndex(wc => wc.equals(card)) === -1);
}

export function isSequence(cards: Card[], wildCards: Card[] = []) {
  // There must be at least 3 cards or 13 cards
  if (cards.length < 3 || cards.length > 13) return false;
  // get the normal cards
  const normalCards = removeWildCards(cards, wildCards);

  // if there is 1 card or less left, then no need to check at all, the wild cards
  // work their magic
  if (normalCards.length <= 1) return true;

  let wildCardsCount = cards.length - normalCards.length;

  // Sort the cards by rank
  normalCards.sort(comparatorRanked);
  let pos = 0;
  const firstCard = normalCards[pos++];
  let card = firstCard;

  // if the first card is an ace, it can be kept at the end or at the
  // beginning depending on other available cards, so we will deal with it
  // at the end

  if (card.rank === Rank.Ace) {
    card = normalCards[pos++];

    // also check for difference right away
    if (card.suit !== firstCard.suit) return false;
    if (card.rank === firstCard.rank) return false;
  }

  while (pos < normalCards.length) {
    const next = normalCards[pos++];
    // if the suites don't match, no sequence
    if (next.suit !== card.suit) return false;
    // if the ranks are same, no sequence
    if (next.rank.id === card.rank.id) return false;

    const diff = next.rank.id - card.rank.id - 1;

    // check we we have enough wild cards to make up the difference
    if (diff > wildCardsCount) return false;

    // update the wild card number
    wildCardsCount -= diff;

    // hand over the checking
    card = next;
  }

  // consider the first card if it was an ace
  if (firstCard.rank === Rank.Ace) {
    if (!wildCardsCount) {
      const beginDiff = normalCards[1].rank.value - 1;
      const ace = normalCards[normalCards.length - 1].rank.value >= Rank.King.value ? Rank.AceLowValue : Rank.AceHighValue;
      const endDiff = ace - normalCards[normalCards.length - 1].rank.value;
      const diff = Math.min(beginDiff, endDiff) - 1;
      if (diff > wildCardsCount) return false;
    } else {
      const ace = normalCards[normalCards.length - 1].rank.value >= Rank.Queen.value ? Rank.AceHighValue : Rank.AceLowValue;
      const beginDiff = Math.log(ace) / Math.log(2);
      const endDiff = Math.abs(beginDiff - Math.log(normalCards[normalCards.length - 1].rank.value) / Math.log(2));
      const diff = endDiff - 1;
      if (diff > wildCardsCount) return false;
    }
  }

  // couldn't prove its not a sequence, so it must be a sequence
  return true;
}
