class SearchesController < ApplicationController
  # top page
  def index
    @json_path = 'public/assets/json/cute.json'
    render 'index', layout: false
  end

  # searched page
  def show
    tweets =
      if params[:screen_name].present? && params[:screen_name].match(/\A@?\w+\z/)
        screen_name = params[:screen_name].match(/\A@?(\w+)\z/)[1]
        @json_path = "public/assets/json/screen_name/#{screen_name}.json"
        client.user_timeline(screen_name).map(&:attrs)
      elsif params[:hashtag].present?
        hashtag = params[:hashtag].starts_with?('#') ? params[:hashtag][1..-1] : params[:hashtag]
        @json_path = "public/assets/json/hash_tag/#{URI.encode(hashtag)}.json"
        client.search("##{hashtag}")
      end

    if tweets.nil?
      return render text: 'You need to specify a screen_name or a hashtag.'
    end

    begin
      PhotosUpdater.new({tweets: tweets, json_path: @json_path}).run
    rescue => e
      logger.warn e.inspect
      raise e
    end

    @json_path = URI.encode(@json_path)

    render 'index', layout: false
  end

  private

  def client
    @client ||= ExTwitter.new(YAML.load_file(Rails.root.join('config/twitter.yml')))
  end
end
