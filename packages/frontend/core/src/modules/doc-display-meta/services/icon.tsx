import { type IconData, IconRenderer, IconType } from '@affine/component';
import * as litIcons from '@blocksuite/icons/lit';
import { html } from 'lit';

export const getDocIconComponent = (icon: IconData) => {
  const Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <IconRenderer data={icon} {...props} />
  );
  Icon.displayName = 'DocIcon';
  return Icon;
};

export const getDocIconComponentLit = (icon: IconData) => {
  return () => {
    if (icon.type === IconType.Emoji) {
      return html`<div class="icon">${icon.unicode}</div>`;
    }
    if (icon.type === IconType.AffineIcon) {
      return html`<div
        style="color: ${icon.color}; display: flex; align-items: center; justify-content: center;"
      >
        ${litIcons[`${icon.name}Icon` as keyof typeof litIcons]()}
      </div>`;
    }
    if (icon.type === IconType.Blob && icon.source) {
      return html`<img
        src=${icon.source}
        alt="Custom icon"
        style="width: 1em; height: 1em; object-fit: cover; border-radius: 6px; display: inline-block; vertical-align: middle; image-rendering: auto;"
      />`;
    }
    return null;
  };
};
