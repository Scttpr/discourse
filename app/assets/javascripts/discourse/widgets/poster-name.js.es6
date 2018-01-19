import { iconNode } from 'discourse-common/lib/icon-library';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { formatUsername } from 'discourse/lib/utilities';

function sanitizeName(name){
  return name.toLowerCase().replace(/[\s_-]/g,'');
}

export default createWidget('poster-name', {
  tagName: 'div.names.trigger-user-card',

  settings: {
    showNameAndGroup: true,
    showGlyph: true
  },

  // TODO: Allow extensibility
  posterGlyph(attrs) {
    if (attrs.moderator) {
      return iconNode('shield', { title: I18n.t('user.moderator_tooltip') });
    }
  },

  userLink(attrs, text) {
    return h(
      'a',
      { attributes: { href: attrs.usernameUrl, 'data-user-card': attrs.username } },
      formatUsername(text)
    );
  },

  html(attrs) {
    const username = attrs.username;
    const name = attrs.name;
    const nameFirst = this.siteSettings.display_name_on_posts && !this.siteSettings.prioritize_username_in_ux && name && name.trim().length > 0;
    const classNames = nameFirst ? ['first','full-name'] : ['first','username'];

    if (attrs.staff) { classNames.push('staff'); }
    if (attrs.admin) { classNames.push('admin'); }
    if (attrs.moderator) { classNames.push('moderator'); }
    if (attrs.new_user) { classNames.push('new-user'); }

    const primaryGroupName = attrs.primary_group_name;
    if (primaryGroupName && primaryGroupName.length) {
      classNames.push(primaryGroupName);
    }
    const nameContents = [ this.userLink(attrs, nameFirst ? name : username) ];

    if (this.settings.showGlyph) {
      const glyph = this.posterGlyph(attrs);
      if (glyph) { nameContents.push(glyph); }
    }

    const contents = [h('span', { className: classNames.join(' ') }, nameContents)];

    if (!this.settings.showNameAndGroup) {
      return contents;
    }

    if (name && this.siteSettings.display_name_on_posts && sanitizeName(name) !== sanitizeName(username)) {
      contents.push(h('span.second.' + (nameFirst ? "username" : "full-name"),
            this.userLink(attrs, nameFirst ? username : name)));
    }
    const title = attrs.user_title;
    if (title && title.length) {
      let titleContents = title;
      if (primaryGroupName) {
        const href = Discourse.getURL(`/groups/${primaryGroupName}`);
        titleContents = h('a.user-group', { attributes: { href } }, title);
      }
      contents.push(h('span.user-title', titleContents));
    }

    return contents;
  }
});
