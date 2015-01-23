require 'ex_twitter'

class Script
  CONFIG = YAML.load_file('config/twitter.yml')

  NAMES = %w(0612kazuha AgusuHerudi chantichanti22 juicyloveberry maroka1029
    mizuki_momoko momo_ninomiya ryoshihono s5hjvwyk shizaki_hinata suzukisakiika
    tomoe_0116 y_amamiya_y yoshida_saki yukakuramoti)

  def run
    users = client.users(NAMES)
    photos = users.map { |user| fetch_photos(user) }.flatten

    puts photos.size
    puts photos.map{|p| p.attrs[:media_url] }
  end

  private

  def client
    @client ||= ExTwitter.new(CONFIG)
  end

  def fetch_photos(user)
    p = client.user_photos(user, {max_paginates: 1, count: 3})
    puts "#{user.screen_name}, #{p.size}"
    p
  rescue => e
    puts "#{e.inspect} #{user.screen_name}"
    puts e.backtrace[0, 5].join("\n")
    []
  end
end

Script.new.run